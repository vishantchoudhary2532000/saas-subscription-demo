'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { userApi, stripeApi } from '@/lib/api';
import { isAuthenticated, removeToken } from '@/lib/auth';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [protectedData, setProtectedData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verifyingPayment, setVerifyingPayment] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get('session_id');
        
        if (sessionId) {
          window.history.replaceState({}, '', '/dashboard');
          setVerifyingPayment(true);
          
          let attempts = 0;
          const maxAttempts = 10;
          const pollInterval = 1000;
          
          const pollPaymentStatus = async () => {
            try {
              const result = await stripeApi.verifySession(sessionId);
              
              if (result.verified && result.paid) {
                setVerifyingPayment(false);
                const profile = await userApi.getProfile();
                setUser(profile);
                
                if (profile.isPaid) {
                  try {
                    const data = await userApi.getProtectedData();
                    setProtectedData(data);
                  } catch (err: any) {
                    if (err.message.includes('Subscription required')) {
                      setError('Subscription required to access this content');
                    }
                  }
                }
                setLoading(false);
                return;
              }
              
              attempts++;
              if (attempts < maxAttempts) {
                setTimeout(pollPaymentStatus, pollInterval);
              } else {
                setVerifyingPayment(false);
                const profile = await userApi.getProfile();
                setUser(profile);
                setLoading(false);
              }
            } catch (err: any) {
              console.error('Payment verification error:', err);
              attempts++;
              if (attempts < maxAttempts) {
                setTimeout(pollPaymentStatus, pollInterval);
              } else {
                setVerifyingPayment(false);
                const profile = await userApi.getProfile();
                setUser(profile);
                setLoading(false);
              }
            }
          };
          
          pollPaymentStatus();
          return;
        }

        const profile = await userApi.getProfile();
        setUser(profile);

        if (profile.isPaid) {
          try {
            const data = await userApi.getProtectedData();
            setProtectedData(data);
          } catch (err: any) {
            if (err.message.includes('Subscription required')) {
              setError('Subscription required to access this content');
            }
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = () => {
    removeToken();
    router.push('/');
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '3rem',
          textAlign: 'center',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
        }}>
          {verifyingPayment ? (
            <div>
              <div className="spinner" style={{
                width: '48px',
                height: '48px',
                border: '4px solid #e5e7eb',
                borderTop: '4px solid #6366f1',
                borderRadius: '50%',
                margin: '0 auto 1rem'
              }}></div>
              <p style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1f2937' }}>
                Verifying payment...
              </p>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                Please wait while we confirm your subscription
              </p>
            </div>
          ) : (
            <div>
              <div className="spinner" style={{
                width: '48px',
                height: '48px',
                border: '4px solid #e5e7eb',
                borderTop: '4px solid #6366f1',
                borderRadius: '50%',
                margin: '0 auto 1rem'
              }}></div>
              <p style={{ color: '#6b7280' }}>Loading...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
      padding: '1.5rem 1rem'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        width: '100%',
        margin: '0 auto'
      }}>
        {/* Header Section */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h1 style={{ 
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: '800',
              marginBottom: '0.25rem',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: '1.2'
            }}>
              Dashboard
            </h1>
            <p style={{ color: '#6b7280', fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}>
              Welcome back! Manage your account and subscription
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: 'clamp(0.875rem, 2vw, 1rem)',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 6px rgba(239, 68, 68, 0.3)',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 12px rgba(239, 68, 68, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(239, 68, 68, 0.3)';
            }}
          >
            Logout
          </button>
        </div>

        {/* Main Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          {/* Profile Card */}
          {user && (
            <div style={{ 
              background: 'white',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '1.25rem'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '1rem',
                  color: 'white',
                  fontWeight: '700',
                  fontSize: '1.25rem'
                }}>
                  {user.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 style={{ 
                    fontSize: 'clamp(1.125rem, 2.5vw, 1.25rem)', 
                    marginBottom: '0.25rem',
                    fontWeight: '700',
                    color: '#1f2937'
                  }}>
                    Profile
                  </h2>
                  <p style={{ color: '#6b7280', fontSize: 'clamp(0.75rem, 1.8vw, 0.875rem)' }}>
                    Account information
                  </p>
                </div>
              </div>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <div style={{ 
                  padding: '0.875rem',
                  background: '#f9fafb',
                  borderRadius: '10px',
                  border: '1px solid #e5e7eb'
                }}>
                  <p style={{ 
                    color: '#6b7280', 
                    fontSize: 'clamp(0.75rem, 1.8vw, 0.8125rem)',
                    marginBottom: '0.375rem',
                    fontWeight: '600'
                  }}>
                    Email Address
                  </p>
                  <p style={{ 
                    color: '#1f2937', 
                    fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                    fontWeight: '500',
                    wordBreak: 'break-word'
                  }}>
                    {user.email}
                  </p>
                </div>
                <div style={{ 
                  padding: '0.875rem',
                  background: '#f9fafb',
                  borderRadius: '10px',
                  border: '1px solid #e5e7eb'
                }}>
                  <p style={{ 
                    color: '#6b7280', 
                    fontSize: 'clamp(0.75rem, 1.8vw, 0.8125rem)',
                    marginBottom: '0.375rem',
                    fontWeight: '600'
                  }}>
                    Subscription Status
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ 
                      color: user.isPaid ? '#10b981' : '#ef4444',
                      fontWeight: '700',
                      padding: '0.375rem 0.875rem',
                      borderRadius: '8px',
                      background: user.isPaid ? '#d1fae5' : '#fee2e2',
                      fontSize: 'clamp(0.75rem, 1.8vw, 0.875rem)',
                      whiteSpace: 'nowrap',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.375rem'
                    }}>
                      {user.isPaid ? '✓' : '✗'} {user.isPaid ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subscription Status Card */}
          {user && !user.isPaid && (
            <div style={{ 
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              borderRadius: '16px',
              padding: '1.5rem',
              border: '2px solid #f59e0b',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '1rem'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: '#f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '1rem',
                  color: 'white',
                  fontWeight: '700',
                  fontSize: '1.5rem'
                }}>
                  ⚠
                </div>
                <h2 style={{ 
                  fontSize: 'clamp(1.125rem, 2.5vw, 1.25rem)',
                  fontWeight: '700',
                  color: '#92400e',
                  margin: 0
                }}>
                  Upgrade Required
                </h2>
              </div>
              <p style={{ 
                color: '#78350f', 
                fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                marginBottom: '1.25rem',
                lineHeight: '1.6'
              }}>
                Unlock premium features with an active subscription. Get access to protected content and exclusive features.
              </p>
              <Link 
                href="/pricing" 
                style={{ 
                  display: 'inline-block',
                  padding: '0.875rem 1.5rem',
                  background: '#6366f1',
                  color: 'white',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 6px rgba(99, 102, 241, 0.3)',
                  textAlign: 'center',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 12px rgba(99, 102, 241, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(99, 102, 241, 0.3)';
                }}
              >
                Subscribe Now →
              </Link>
            </div>
          )}

          {/* Premium Content Card */}
          {user && user.isPaid && (
            <div style={{ 
              background: 'white',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              border: '2px solid #e5e7eb',
              gridColumn: user.isPaid ? 'span 2' : 'span 1'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '1.25rem'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '1rem',
                  color: 'white',
                  fontWeight: '700',
                  fontSize: '1.5rem',
                  flexShrink: 0
                }}>
                  ⭐
                </div>
                <div>
                  <h2 style={{ 
                    fontSize: 'clamp(1.125rem, 2.5vw, 1.25rem)',
                    fontWeight: '700',
                    color: '#1f2937',
                    margin: 0,
                    marginBottom: '0.25rem'
                  }}>
                    Premium Content
                  </h2>
                  <p style={{ 
                    color: '#6b7280', 
                    fontSize: 'clamp(0.75rem, 1.8vw, 0.875rem)',
                    margin: 0
                  }}>
                    Exclusive access for subscribers
                  </p>
                </div>
              </div>
              {protectedData ? (
                <div style={{ 
                  padding: '1.25rem', 
                  background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                  borderRadius: '12px',
                  border: '2px solid #bae6fd'
                }}>
                  <p style={{ 
                    fontWeight: '700', 
                    marginBottom: '0.75rem',
                    color: '#1f2937',
                    fontSize: 'clamp(1rem, 2.2vw, 1.125rem)'
                  }}>
                    {protectedData.message}
                  </p>
                  <p style={{ 
                    color: '#374151',
                    lineHeight: '1.7',
                    fontSize: 'clamp(0.875rem, 2vw, 1rem)'
                  }}>
                    {protectedData.data}
                  </p>
                </div>
              ) : (
                <div style={{ 
                  padding: '1.25rem', 
                  background: '#f9fafb',
                  borderRadius: '12px',
                  textAlign: 'center',
                  color: '#6b7280',
                  fontSize: 'clamp(0.875rem, 2vw, 1rem)'
                }}>
                  Loading premium content...
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ 
            padding: '1rem 1.25rem', 
            background: '#fee2e2', 
            border: '2px solid #fecaca', 
            borderRadius: '12px',
            color: '#dc2626',
            textAlign: 'center',
            fontWeight: '600',
            fontSize: 'clamp(0.875rem, 2vw, 1rem)',
            marginBottom: '1.5rem'
          }}>
            {error}
          </div>
        )}

        {/* Quick Actions */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <Link 
            href="/pricing"
            style={{
              padding: '1rem',
              background: 'white',
              borderRadius: '12px',
              textDecoration: 'none',
              border: '1px solid #e5e7eb',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.borderColor = '#6366f1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
              e.currentTarget.style.borderColor = '#e5e7eb';
            }}
          >
            <div style={{ 
              fontSize: '1.5rem', 
              marginBottom: '0.5rem',
              color: '#6366f1'
            }}>
              💳
            </div>
            <h3 style={{ 
              fontSize: 'clamp(0.875rem, 2vw, 1rem)',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '0.25rem'
            }}>
              Pricing
            </h3>
            <p style={{ 
              color: '#6b7280',
              fontSize: 'clamp(0.75rem, 1.8vw, 0.875rem)',
              margin: 0
            }}>
              View plans
            </p>
          </Link>

          <Link 
            href="/"
            style={{
              padding: '1rem',
              background: 'white',
              borderRadius: '12px',
              textDecoration: 'none',
              border: '1px solid #e5e7eb',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.borderColor = '#6366f1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
              e.currentTarget.style.borderColor = '#e5e7eb';
            }}
          >
            <div style={{ 
              fontSize: '1.5rem', 
              marginBottom: '0.5rem',
              color: '#6366f1'
            }}>
              🏠
            </div>
            <h3 style={{ 
              fontSize: 'clamp(0.875rem, 2vw, 1rem)',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '0.25rem'
            }}>
              Home
            </h3>
            <p style={{ 
              color: '#6b7280',
              fontSize: 'clamp(0.75rem, 1.8vw, 0.875rem)',
              margin: 0
            }}>
              Back to home
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}

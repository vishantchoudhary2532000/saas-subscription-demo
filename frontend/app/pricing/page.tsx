'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { stripeApi, userApi } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userStatus, setUserStatus] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated()) {
        setIsLoggedIn(true);
        try {
          const profile = await userApi.getProfile();
          setUserStatus(profile);
        } catch (err) {
          console.error('Failed to fetch profile:', err);
        }
      }
    };
    checkAuth();
  }, []);

  const handleSubscribe = async () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await stripeApi.createCheckoutSession();
      if (response.url) {
        window.location.href = response.url;
      } else {
        setError('Failed to create checkout session');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to start checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
      padding: '3rem 1.5rem'
    }}>
      <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: '800',
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Simple Pricing
          </h1>
          <p style={{ fontSize: '1.125rem', color: '#6b7280', maxWidth: '600px', margin: '0 auto' }}>
            Choose the perfect plan for your needs
          </p>
        </div>

        {userStatus && (
          <div style={{ 
            padding: '1rem 1.5rem', 
            marginBottom: '2rem', 
            background: userStatus.isPaid 
              ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' 
              : 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            border: `2px solid ${userStatus.isPaid ? '#10b981' : '#f59e0b'}`,
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            {userStatus.isPaid ? (
              <p style={{ margin: 0, color: '#065f46', fontWeight: '600' }}>
                ✓ You have an active subscription!{' '}
                <Link href="/dashboard" style={{ color: '#6366f1', textDecoration: 'underline' }}>
                  Go to Dashboard
                </Link>
              </p>
            ) : (
              <p style={{ margin: 0, color: '#92400e', fontWeight: '600' }}>
                You don't have an active subscription yet.
              </p>
            )}
          </div>
        )}

        <div style={{ 
          background: 'white',
          borderRadius: '20px', 
          padding: '3rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          border: '2px solid #e5e7eb',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            color: 'white',
            padding: '0.5rem 1.5rem',
            borderRadius: '0 20px 0 20px',
            fontSize: '0.875rem',
            fontWeight: '700'
          }}>
            POPULAR
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ 
              fontSize: '1.75rem', 
              fontWeight: '700',
              marginBottom: '0.5rem',
              color: '#1f2937'
            }}>
              Premium Plan
            </h2>
            <div style={{ 
              fontSize: '3rem', 
              fontWeight: '800',
              marginBottom: '0.5rem',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              $9.99
              <span style={{ fontSize: '1.5rem', color: '#6b7280', fontWeight: '400' }}>/month</span>
            </div>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Billed monthly, cancel anytime
            </p>
          </div>

          <ul style={{ 
            listStyle: 'none',
            marginBottom: '2rem',
            padding: 0
          }}>
            {[
              'Access to all premium features',
              'Protected API endpoints',
              'Priority customer support',
              'Real-time updates',
              'Cancel anytime'
            ].map((feature, idx) => (
              <li key={idx} style={{ 
                padding: '0.75rem 0',
                display: 'flex',
                alignItems: 'center',
                borderBottom: idx < 4 ? '1px solid #f3f4f6' : 'none'
              }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  color: 'white',
                  marginRight: '1rem',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  flexShrink: 0
                }}>
                  ✓
                </span>
                <span style={{ color: '#374151', fontSize: '1rem' }}>{feature}</span>
              </li>
            ))}
          </ul>

          {error && (
            <div style={{ 
              padding: '0.75rem',
              marginBottom: '1rem',
              background: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              color: '#dc2626',
              fontSize: '0.875rem',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <button
            onClick={handleSubscribe}
            disabled={loading || (userStatus?.isPaid)}
            style={{
              width: '100%',
              padding: '1rem',
              background: userStatus?.isPaid 
                ? '#9ca3af' 
                : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.125rem',
              fontWeight: '700',
              cursor: loading || userStatus?.isPaid ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: loading || userStatus?.isPaid 
                ? 'none' 
                : '0 10px 20px rgba(99, 102, 241, 0.3)'
            }}
            onMouseEnter={(e) => {
              if (!loading && !userStatus?.isPaid) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 15px 30px rgba(99, 102, 241, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && !userStatus?.isPaid) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 20px rgba(99, 102, 241, 0.3)';
              }
            }}
          >
            {loading 
              ? 'Processing...' 
              : userStatus?.isPaid 
              ? '✓ Already Subscribed' 
              : isLoggedIn 
              ? 'Subscribe Now' 
              : 'Login to Subscribe'}
          </button>
        </div>

        {!isLoggedIn && (
          <p style={{ 
            textAlign: 'center', 
            color: '#6b7280',
            marginTop: '2rem',
            fontSize: '0.875rem'
          }}>
            <Link href="/login" style={{ color: '#6366f1', fontWeight: '600' }}>Login</Link> or{' '}
            <Link href="/register" style={{ color: '#6366f1', fontWeight: '600' }}>Register</Link> to subscribe
          </p>
        )}
      </div>
    </div>
  );
}

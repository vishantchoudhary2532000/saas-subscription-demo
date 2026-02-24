'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="container" style={{ paddingTop: '1rem', paddingBottom: '4rem' }}>
        <header style={{ textAlign: 'center', marginBottom: '4rem', color: 'white' }}>
          <h1 style={{ 
            fontSize: '3.5rem', 
            fontWeight: '800',
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #fff 0%, #e0e7ff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            SaaS Subscription Demo
          </h1>
          <p style={{ fontSize: '1.25rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>
            A modern full-stack subscription platform with Stripe integration
          </p>
        </header>

        <nav style={{ 
          display: 'flex', 
          gap: '1rem', 
          justifyContent: 'center',
          marginBottom: '4rem',
          flexWrap: 'wrap'
        }}>
          <Link 
            href="/login" 
            className="link-hover link-hover-white"
            style={{ 
              padding: '0.75rem 1.5rem', 
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              borderRadius: '8px',
              fontWeight: '600',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              display: 'inline-block'
            }}
          >
            Login
          </Link>
          <Link 
            href="/register" 
            className="link-hover link-hover-shadow"
            style={{ 
              padding: '0.75rem 1.5rem', 
              background: 'white',
              color: '#667eea',
              borderRadius: '8px',
              fontWeight: '600',
              display: 'inline-block',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
          >
            Get Started
          </Link>
          <Link 
            href="/pricing" 
            className="link-hover link-hover-white"
            style={{ 
              padding: '0.75rem 1.5rem', 
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              borderRadius: '8px',
              fontWeight: '600',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              display: 'inline-block'
            }}
          >
            Pricing
          </Link>
        </nav>

        <main style={{ 
          background: 'white',
          borderRadius: '16px',
          padding: '3rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          maxWidth: '900px',
          margin: '0 auto'
        }}>
          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ 
              fontSize: '2rem', 
              marginBottom: '1.5rem',
              color: '#1f2937',
              fontWeight: '700'
            }}>
              Features
            </h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem'
            }}>
              {[
                { title: 'Secure Authentication', desc: 'JWT-based user authentication' },
                { title: 'Stripe Integration', desc: 'Seamless payment processing' },
                { title: 'Webhook Handling', desc: 'Real-time payment verification' },
                { title: 'Protected Routes', desc: 'Subscription-based access control' },
                { title: 'Modern UI', desc: 'Clean and responsive design' },
                { title: 'Real-time Updates', desc: 'Instant subscription status sync' }
              ].map((feature, idx) => (
                <div 
                  key={idx}
                  style={{
                    padding: '1.5rem',
                    background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb'
                  }}
                >
                  <h3 style={{ 
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    color: '#374151'
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section style={{ 
            textAlign: 'center',
            padding: '2rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            color: 'white'
          }}>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem', fontWeight: '700' }}>
              Ready to Get Started?
            </h2>
            <p style={{ marginBottom: '1.5rem', opacity: 0.9 }}>
              Register for an account and unlock premium features with a subscription.
            </p>
            <Link 
              href="/register" 
              className="link-hover link-hover-shadow"
              style={{ 
                display: 'inline-block', 
                padding: '0.875rem 2rem', 
                background: 'white', 
                color: '#667eea', 
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '1rem',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            >
              Start Free Trial
            </Link>
          </section>
        </main>
      </div>
    </div>
  );
}

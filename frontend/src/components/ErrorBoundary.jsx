import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '520px',
            backgroundColor: 'var(--color-bg-card, #ffffff)',
            borderRadius: '12px',
            padding: '2.5rem 2rem',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid var(--color-border, #e5e7eb)'
          }}>
            <AlertCircle size={48} style={{ color: 'var(--color-accent-terracotta, #ef4444)', marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--color-text-main, #111827)' }}>
              Something went wrong loading this page
            </h2>
            <p style={{ color: 'var(--color-text-secondary, #6b7280)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              {this.state.error?.message || 'An unexpected rendering error occurred. Please refresh the page or return home.'}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button 
                onClick={this.handleReload} 
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <RefreshCw size={16} />
                Reload Page
              </button>
              <button 
                onClick={this.handleHome} 
                className="btn btn-secondary"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

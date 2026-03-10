import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { documentsApi } from '../api/documents';
import { useAuthStore } from '../store';

export const InvitePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { token: authToken } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!authToken) {
      // Store invite token and redirect to login
      localStorage.setItem('pendingInvite', token || '');
      navigate('/login');
      return;
    }

    if (token) {
      documentsApi.acceptInvite(token)
        .then((res) => {
          setStatus('success');
          setMessage('Invite accepted!');
          const doc = res.data.document;
          if (doc) {
            setTimeout(() => navigate(`/documents/${doc.id}`), 1500);
          }
        })
        .catch((err) => {
          setStatus('error');
          setMessage(err.response?.data?.error || 'Failed to accept invite.');
        });
    }
  }, [token, authToken, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg-primary)' }}>
      <div className="glass-card p-8 text-center max-w-md">
        {status === 'loading' && (
          <>
            <div className="animate-spin h-8 w-8 border-2 rounded-full mx-auto mb-4"
                 style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-accent)' }} />
            <p style={{ color: 'var(--color-text-secondary)' }}>Accepting invite...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <p className="text-lg font-semibold text-green-400 mb-2">{message}</p>
            <p style={{ color: 'var(--color-text-secondary)' }}>Redirecting to document...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <p className="text-lg font-semibold text-red-400 mb-2">{message}</p>
            <button onClick={() => navigate('/documents')} className="btn-primary mt-4">
              Go to Documents
            </button>
          </>
        )}
      </div>
    </div>
  );
};

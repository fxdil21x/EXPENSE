import { useAuth } from '../context/AuthContext';

export function PendingApproval() {
  const { profile, signOutUser } = useAuth();
  const rejected = profile?.status === 'rejected';

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className={`status-icon ${rejected ? 'status-rejected' : 'status-pending'}`}>
          {rejected ? (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          ) : (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          )}
        </div>
        <h1 className="auth-title">{rejected ? 'Access denied' : 'Waiting for approval'}</h1>
        <p className="auth-copy">
          {rejected
            ? 'An admin has denied access to this account. If you believe this is a mistake, contact your administrator.'
            : "Your account has been created and is waiting for an admin to approve access. You'll be able to use the app as soon as that happens."}
        </p>
        <p className="auth-account">Signed in as {profile?.email}</p>
        <button type="button" className="btn btn-secondary" onClick={signOutUser}>
          Sign out
        </button>
      </div>
    </div>
  );
}

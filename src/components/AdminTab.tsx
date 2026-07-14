import { useAdmin } from '../hooks/useAdmin';
import { useAuth } from '../context/AuthContext';

function statusBadgeClass(status: string) {
  if (status === 'approved') return 'badge badge-approved';
  if (status === 'rejected') return 'badge badge-rejected';
  return 'badge badge-pending';
}

export function AdminTab() {
  const { user, profile } = useAuth();
  const { users, pending, loaded, approveUser, rejectUser, revokeUser } = useAdmin(true, user?.uid ?? null);

  const others = users.filter((u) => u.uid !== profile?.uid);

  return (
    <>
      <section className="panel-card" style={{ marginBottom: 28 }}>
        <div className="panel-header">
          <div>
            <p className="eyebrow">Admin</p>
            <h2>Pending approvals</h2>
          </div>
        </div>

        {!loaded ? (
          <p className="empty-description">Loading…</p>
        ) : pending.length === 0 ? (
          <p className="empty-description">No accounts waiting for approval.</p>
        ) : (
          <div className="user-table">
            {pending.map((candidate) => (
              <div key={candidate.uid} className="user-row">
                <div className="category-info">
                  {candidate.photoURL ? (
                    <img className="user-avatar" src={candidate.photoURL} alt={candidate.displayName} referrerPolicy="no-referrer" />
                  ) : (
                    <div className="user-avatar user-avatar-fallback">{candidate.displayName?.[0] ?? '?'}</div>
                  )}
                  <div>
                    <p className="expense-title">{candidate.displayName}</p>
                    <p className="expense-meta">{candidate.email}</p>
                  </div>
                </div>
                <div className="expense-actions">
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => approveUser(candidate.uid)}>
                    Approve
                  </button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => rejectUser(candidate.uid)}>
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="panel-card">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Admin</p>
            <h2>All users</h2>
          </div>
        </div>

        {!loaded ? (
          <p className="empty-description">Loading…</p>
        ) : others.length === 0 ? (
          <p className="empty-description">No other users yet.</p>
        ) : (
          <div className="user-table">
            {others.map((candidate) => (
              <div key={candidate.uid} className="user-row">
                <div className="category-info">
                  {candidate.photoURL ? (
                    <img className="user-avatar" src={candidate.photoURL} alt={candidate.displayName} referrerPolicy="no-referrer" />
                  ) : (
                    <div className="user-avatar user-avatar-fallback">{candidate.displayName?.[0] ?? '?'}</div>
                  )}
                  <div>
                    <p className="expense-title">
                      {candidate.displayName} {candidate.role === 'admin' && <span className="badge badge-admin">Admin</span>}
                    </p>
                    <p className="expense-meta">{candidate.email}</p>
                  </div>
                </div>
                <div className="expense-actions">
                  <span className={statusBadgeClass(candidate.status)}>{candidate.status}</span>
                  {candidate.role !== 'admin' && candidate.status !== 'approved' && (
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => approveUser(candidate.uid)}>
                      Approve
                    </button>
                  )}
                  {candidate.role !== 'admin' && candidate.status === 'approved' && (
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => revokeUser(candidate.uid)}>
                      Revoke
                    </button>
                  )}
                  {candidate.role !== 'admin' && candidate.status !== 'rejected' && (
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => rejectUser(candidate.uid)}>
                      Reject
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

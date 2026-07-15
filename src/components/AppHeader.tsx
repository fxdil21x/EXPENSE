import { useAuth } from '../context/AuthContext';

export type TabKey = 'dashboard' | 'insights' | 'admin';

export function AppHeader({
  activeTab,
  onTabChange,
  isAdmin,
  pendingCount,
}: {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  isAdmin: boolean;
  pendingCount: number;
}) {
  const { profile, signOutUser } = useAuth();

  const tabs: Array<{ key: TabKey; label: string; badge?: number }> = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'insights', label: 'Insights' },
    ...(isAdmin ? [{ key: 'admin' as TabKey, label: 'Admin', badge: pendingCount || undefined }] : []),
  ];

  return (
    <header className="app-header">
      <nav className="tab-nav">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`tab-nav-item ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => onTabChange(tab.key)}
          >
            {tab.label}
            {!!tab.badge && <span className="tab-badge">{tab.badge}</span>}
          </button>
        ))}
      </nav>

      <div className="header-actions">
        <div className="user-chip">
          {profile?.photoURL ? (
            <img className="user-avatar" src={profile.photoURL} alt={profile.displayName} referrerPolicy="no-referrer" />
          ) : (
            <div className="user-avatar user-avatar-fallback">{profile?.displayName?.[0] ?? '?'}</div>
          )}
          <span className="user-name">{profile?.displayName}</span>
        </div>
        <button type="button" className="btn-icon" onClick={signOutUser} aria-label="Sign out" title="Sign out">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </header>
  );
}

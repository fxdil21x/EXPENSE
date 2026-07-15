import { useState, useEffect } from 'react';
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
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  const tabs: Array<{ key: TabKey; label: string; badge?: number }> = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'insights', label: 'Insights' },
    ...(isAdmin ? [{ key: 'admin' as TabKey, label: 'Admin', badge: pendingCount || undefined }] : []),
  ];

  return (
    <header className="app-header">
      <div className="logo">
        <div className="logo-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        <span className="logo-text">Expense Tracker</span>
      </div>

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
        {deferredPrompt && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowInstallGuide(!showInstallGuide)}
            title="Install this app"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Install
          </button>
        )}

        {showInstallGuide && (
          <div className="install-guide" style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '16px',
            width: '320px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            zIndex: 1000
          }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>Install App</h3>
            <button
              onClick={handleInstall}
              style={{
                width: '100%',
                padding: '8px',
                marginBottom: '8px',
                backgroundColor: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500
              }}
            >
              Install Now
            </button>
            <p style={{ fontSize: '0.75rem', color: '#666', lineHeight: 1.5, marginBottom: '8px' }}
            >The app will be installed on your home screen for quick access.</p>
          </div>
        )}
        
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

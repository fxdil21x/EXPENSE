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
  const { profile, signOutUser, updateProfile } = useAuth();
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(profile?.displayName || '');

  useEffect(() => {
    setEditedName(profile?.displayName || '');
  }, [profile?.displayName]);

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

  const handleSaveName = async () => {
    if (editedName.trim() && editedName !== profile?.displayName) {
      try {
        await updateProfile({ displayName: editedName.trim() });
        setIsEditingName(false);
      } catch (err) {
        console.error('Failed to update name:', err);
      }
    } else {
      setIsEditingName(false);
    }
  };

  const handleCloseProfile = () => {
    setShowProfileMenu(false);
    setIsEditingName(false);
    setEditedName(profile?.displayName || '');
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

        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="user-chip"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            {profile?.photoURL ? (
              <img className="user-avatar" src={profile.photoURL} alt={profile.displayName} referrerPolicy="no-referrer" />
            ) : (
              <div className="user-avatar user-avatar-fallback">{profile?.displayName?.[0] ?? '?'}</div>
            )}
            <span className="user-name">{profile?.displayName}</span>
          </button>

          {showProfileMenu && (
            <div className="profile-menu" style={{
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
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '4px', color: '#111' }}>Your Name</label>
                {isEditingName ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '8px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        fontFamily: 'inherit'
                      }}
                      autoFocus
                    />
                    <button
                      onClick={handleSaveName}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#4f46e5',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.875rem', color: '#374151' }}>{profile?.displayName}</span>
                    <button
                      onClick={() => setIsEditingName(true)}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#f3f4f6',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 500
                      }}
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #e5e7eb' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px', color: '#111' }}>Install App</label>
                
                {deferredPrompt ? (
                  <button
                    onClick={() => {
                      handleInstall();
                      handleCloseProfile();
                    }}
                    style={{
                      width: '100%',
                      padding: '8px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      marginBottom: '6px'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Install Now
                  </button>
                ) : null}

                <div style={{ 
                  backgroundColor: '#f0f9ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '6px',
                  padding: '10px',
                  fontSize: '0.75rem',
                  lineHeight: 1.5,
                  color: '#1e40af'
                }}>
                  <p style={{ margin: '0 0 6px 0', fontWeight: 600 }}>How to add to home screen:</p>
                  <p style={{ margin: '0 0 4px 0' }}>📱 <strong>iPhone/iPad:</strong> Tap Share → Add to Home Screen</p>
                  <p style={{ margin: '0 0 4px 0' }}>🤖 <strong>Android:</strong> Menu (⋮) → Install app</p>
                  <p style={{ margin: 0 }}>💻 <strong>Desktop:</strong> Click the install icon in your address bar</p>
                </div>
              </div>

              <button
                onClick={() => {
                  signOutUser();
                  handleCloseProfile();
                }}
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  border: '1px solid #fecaca',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>

        <button type="button" className="btn-icon" onClick={signOutUser} aria-label="Sign out" title="Sign out" style={{ display: 'none' }}>

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

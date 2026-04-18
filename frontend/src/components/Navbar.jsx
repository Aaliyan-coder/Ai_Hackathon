import React from 'react';

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'swiper', label: 'Swiper' },
  { id: 'quiz', label: 'Quiz Me' },
  { id: 'detector', label: 'Skill Gap' },
  { id: 'profile', label: 'Profile' }
];

function HealthBadge({ up }) {
  if (up === null || up === undefined) return null;
  return (
    <span className={`pipeline-badge ${up ? '' : 'offline'}`} title={up ? 'Backend reachable' : 'Backend not responding'}>
      <span className="dot" />
      {up ? 'API' : 'offline'}
    </span>
  );
}

export default function Navbar({ current, onNavigate, theme, onToggleTheme, backendUp, onSignOut }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="navbar-brand-dot" />
        <span>Inbox Intel</span>
      </div>
      <div className="navbar-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`nav-tab ${current === t.id ? 'active' : ''}`}
            onClick={() => onNavigate(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <HealthBadge up={backendUp} />
      <button className="theme-toggle" onClick={onToggleTheme} aria-label="Toggle theme">
        {theme === 'light' ? '☾' : '☀'}
      </button>
      {onSignOut && (
        <button className="btn btn-ghost btn-sm" onClick={onSignOut} style={{ fontSize: '0.8rem' }}>
          Sign out
        </button>
      )}
    </nav>
  );
}

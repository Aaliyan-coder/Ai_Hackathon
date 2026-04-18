import React, { useState, useMemo } from 'react';
import EmailCard from './EmailCard';
import EmailIngestion from './EmailIngestion';

const URGENCY_WEIGHT = { critical: 4, high: 3, medium: 2, low: 1 };

function sortEmails(emails) {
  return [...emails].sort((a, b) => {
    const sa = URGENCY_WEIGHT[a.urgency] * a.relevance_score;
    const sb = URGENCY_WEIGHT[b.urgency] * b.relevance_score;
    return sb - sa;
  });
}

export default function Dashboard({
  emails,
  loading,
  batchStatus,
  error,
  onExtract,
  onRetry,
  onPrepGuide,
  onGenerateEmail,
  onExpand
}) {
  const [tab, setTab] = useState('all');

  const groups = useMemo(() => {
    const relevant = emails.filter(e => e.classification === 'relevant' && e.relevance_score >= 5);
    const filtered = emails.filter(e => !(e.classification === 'relevant' && e.relevance_score >= 5));
    const critical = relevant.filter(e => e.urgency === 'critical');
    return {
      all: sortEmails(relevant),
      critical: sortEmails(critical),
      filtered: sortEmails(filtered)
    };
  }, [emails]);

  const shown = groups[tab];

  return (
    <div className="container">
      <div className="hero">
        <div className="hero-eyebrow">Dashboard</div>
        <h1>Your opportunities, triaged.</h1>
        <p className="hero-subtitle">
          Paste your inbox below. The agent classifies, scores, and ranks every message against your profile — spam gets quarantined, real opportunities rise to the top.
        </p>
      </div>

      <EmailIngestion onExtract={onExtract} loading={loading} />

      {loading && (
        <div className="status-bar">
          <span className="status-pulse" />
          <span>{batchStatus || 'Analyzing emails with Mistral AI…'}</span>
        </div>
      )}

      {error && (
        <div className="error-box">
          <span>{error}</span>
          {onRetry && <button className="btn btn-ghost btn-sm" onClick={onRetry}>Retry</button>}
        </div>
      )}

      {emails.length > 0 && (
        <>
          <div className="stats-row">
            <div className="stat">
              <div className="stat-num">{groups.all.length}</div>
              <div className="stat-label">Relevant</div>
            </div>
            <div className="stat">
              <div className="stat-num" style={{ color: 'var(--urgent-critical)' }}>{groups.critical.length}</div>
              <div className="stat-label">Critical</div>
            </div>
            <div className="stat">
              <div className="stat-num" style={{ color: 'var(--text-soft)' }}>{groups.filtered.length}</div>
              <div className="stat-label">Filtered out</div>
            </div>
            <div className="stat">
              <div className="stat-num">{emails.length}</div>
              <div className="stat-label">Total processed</div>
            </div>
          </div>

          <div className="tabs-inline">
            <button className={`tab-inline ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>
              All Relevant ({groups.all.length})
            </button>
            <button className={`tab-inline ${tab === 'critical' ? 'active' : ''}`} onClick={() => setTab('critical')}>
              Critical ({groups.critical.length})
            </button>
            <button className={`tab-inline ${tab === 'filtered' ? 'active' : ''}`} onClick={() => setTab('filtered')}>
              Filtered Out ({groups.filtered.length})
            </button>
          </div>
        </>
      )}

      {loading && emails.length === 0 && (
        <div className="dashboard-grid">
          {[0, 1, 2, 3].map(i => <div key={i} className="skeleton" />)}
        </div>
      )}

      {!loading && shown.length === 0 && emails.length > 0 && (
        <div className="empty-state">
          <p>Nothing in this bucket.</p>
        </div>
      )}

      {shown.length > 0 && (
        <div className="dashboard-grid">
          {shown.map(e => (
            <EmailCard
              key={e.id}
              email={e}
              onPrepGuide={onPrepGuide}
              onGenerateEmail={onGenerateEmail}
              onExpand={() => onExpand(e)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

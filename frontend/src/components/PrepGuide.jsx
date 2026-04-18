import React, { useState, useEffect } from 'react';
import { generatePrepGuide } from '../api/client';

const CATEGORY_ORDER = ['DSA', 'OOP', 'System Design', 'Domain Knowledge', 'Soft Skills'];

export default function PrepGuide({ email, profile, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await generatePrepGuide(email, profile);
      setData(res);
    } catch (e) {
      setError(e.message || 'Failed to generate prep guide');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="hero-eyebrow" style={{ marginBottom: 4 }}>Prep Guide</div>
            <h2>{email.organization || 'Preparation plan'}</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: 6, fontSize: '0.9rem' }}>{email.subject}</p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {loading && (
            <>
              <div className="status-bar"><span className="status-pulse" /><span>Building your prep plan…</span></div>
              <div className="skeleton" style={{ marginBottom: 10 }} />
              <div className="skeleton" style={{ minHeight: 120 }} />
            </>
          )}

          {error && (
            <div className="error-box">
              <span>{error}</span>
              <button className="btn btn-ghost btn-sm" onClick={load}>Retry</button>
            </div>
          )}

          {data && (
            <>
              {data.timeline && (
                <div className="detail-section">
                  <div className="detail-label">Suggested timeline</div>
                  <p style={{ fontSize: '0.95rem' }}>{data.timeline}</p>
                </div>
              )}

              {CATEGORY_ORDER.map(cat => {
                const topics = data.categories?.[cat];
                if (!topics || topics.length === 0) return null;
                return (
                  <div key={cat}>
                    <div className="prep-category">{cat}</div>
                    {topics.map((t, i) => (
                      <div key={i} className="prep-topic">
                        <div className="prep-topic-header">
                          <div className="prep-topic-name">{t.topic}</div>
                          <div className="prep-topic-meta">{t.difficulty} · ~{t.hours}h</div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

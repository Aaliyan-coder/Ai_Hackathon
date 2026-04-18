import React, { useState, useEffect } from 'react';
import { generateApplicationEmail } from '../api/client';

export default function EmailGenerator({ email, profile, onClose }) {
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const text = await generateApplicationEmail(email, profile);
      setDraft(text);
    } catch (e) {
      setError(e.message || 'Failed to generate email');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError('Clipboard blocked. Select the text and copy manually.');
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="hero-eyebrow" style={{ marginBottom: 4 }}>Application Draft</div>
            <h2>{email.organization || 'Your email'}</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: 6, fontSize: '0.9rem' }}>
              Edit freely, then copy. Drafted by Mistral Small.
            </p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {loading && (
            <>
              <div className="status-bar"><span className="status-pulse" /><span>Drafting your application…</span></div>
              <div className="skeleton" style={{ minHeight: 220 }} />
            </>
          )}

          {error && (
            <div className="error-box">
              <span>{error}</span>
              <button className="btn btn-ghost btn-sm" onClick={load}>Retry</button>
            </div>
          )}

          {!loading && !error && (
            <div className="copy-wrap">
              <textarea
                className="textarea"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                rows={16}
                style={{ fontFamily: 'inherit', fontSize: '0.92rem', lineHeight: 1.6, minHeight: 320 }}
              />
              <button className="copy-btn" onClick={copy}>
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          )}

          {!loading && !error && (
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button className="btn btn-ghost btn-sm" onClick={load}>Regenerate</button>
              <button className="btn btn-accent btn-sm" onClick={copy} style={{ marginLeft: 'auto' }}>
                {copied ? 'Copied to clipboard' : 'Copy email'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

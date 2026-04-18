import React, { useState } from 'react';
import { detectSkills } from '../api/client';

export default function SkillDetector({ profile, onAddSkills }) {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [added, setAdded] = useState([]);

  async function analyze() {
    if (!text.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setAdded([]);
    try {
      const r = await detectSkills(text, profile);
      setResult(r);
    } catch (e) {
      setError(e.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  }

  function addOne(skill) {
    onAddSkills([skill]);
    setAdded(a => [...a, skill]);
  }

  function addAll(list) {
    onAddSkills(list);
    setAdded(a => [...a, ...list]);
  }

  return (
    <div className="container container-narrow">
      <div className="hero">
        <div className="hero-eyebrow">Skill Gap</div>
        <h1>Find what you're missing.</h1>
        <p className="hero-subtitle">
          Paste a job description, posting, or bio. The agent extracts every skill it mentions, compares it to your profile, and shows you the gap.
        </p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="field">
          <label>Paste text to analyze</label>
          <textarea
            className="textarea"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="We're hiring a Junior ML Engineer. You'll work with PyTorch, distributed training, Kubernetes..."
            rows={8}
            style={{ fontFamily: 'inherit', fontSize: '0.92rem' }}
          />
        </div>
        <button className="btn btn-accent" onClick={analyze} disabled={!text.trim() || loading}>
          {loading ? 'Analyzing…' : 'Extract skills'}
        </button>
      </div>

      {error && <div className="error-box"><span>{error}</span><button className="btn btn-ghost btn-sm" onClick={analyze}>Retry</button></div>}

      {result && (
        <div className="card">
          {result.notes && (
            <div className="detail-section">
              <div className="detail-label">Summary</div>
              <p>{result.notes}</p>
            </div>
          )}

          <div className="skill-gap-grid">
            <div>
              <div className="detail-label" style={{ color: 'var(--urgent-low)' }}>
                ✓ You have ({result.matched?.length || 0})
              </div>
              <div className="chips-row" style={{ marginTop: 8 }}>
                {(result.matched || []).map(s => (
                  <span key={s} className="chip selected" style={{ cursor: 'default' }}>{s}</span>
                ))}
                {(!result.matched || result.matched.length === 0) && (
                  <span style={{ color: 'var(--text-soft)', fontSize: '0.88rem' }}>Nothing matched yet.</span>
                )}
              </div>
            </div>

            <div>
              <div className="detail-label" style={{ color: 'var(--urgent-critical)' }}>
                ✗ Gaps ({result.missing?.length || 0})
              </div>
              <div className="chips-row" style={{ marginTop: 8 }}>
                {(result.missing || []).map(s => {
                  const isAdded = added.includes(s) || profile.skills.includes(s);
                  return (
                    <span
                      key={s}
                      className={`chip ${isAdded ? 'selected' : ''}`}
                      onClick={() => !isAdded && addOne(s)}
                    >
                      {isAdded ? '✓ ' : '+ '}{s}
                    </span>
                  );
                })}
                {(!result.missing || result.missing.length === 0) && (
                  <span style={{ color: 'var(--text-soft)', fontSize: '0.88rem' }}>No gaps — you're covered.</span>
                )}
              </div>
            </div>
          </div>

          {result.suggested_additions && result.suggested_additions.length > 0 && (
            <div className="detail-section" style={{ marginTop: 20 }}>
              <div className="detail-label">Suggested additions to your profile</div>
              <div className="chips-row" style={{ marginTop: 8 }}>
                {result.suggested_additions.map(s => {
                  const isAdded = added.includes(s) || profile.skills.includes(s);
                  return (
                    <span
                      key={s}
                      className={`chip ${isAdded ? 'selected' : ''}`}
                      onClick={() => !isAdded && addOne(s)}
                    >
                      {isAdded ? '✓ ' : '+ '}{s}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {result.missing?.length > 0 && (
            <button
              className="btn btn-accent btn-sm"
              style={{ marginTop: 18 }}
              onClick={() => addAll(result.missing.filter(s => !profile.skills.includes(s) && !added.includes(s)))}
            >
              Add all gaps to profile
            </button>
          )}
        </div>
      )}
    </div>
  );
}

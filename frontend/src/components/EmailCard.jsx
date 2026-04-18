import React, { useState } from 'react';

function daysUntil(deadline) {
  if (!deadline) return null;
  const d = new Date(deadline);
  if (isNaN(d.getTime())) return null;
  return Math.ceil((d - new Date()) / 86400000);
}

function CountdownText({ deadline }) {
  const days = daysUntil(deadline);
  if (days === null) return <span style={{ color: 'var(--text-soft)' }}>No deadline</span>;
  if (days < 0) return <span className="countdown" style={{ color: 'var(--text-soft)' }}>Closed</span>;
  if (days === 0) return <span className="countdown" style={{ color: 'var(--urgent-critical)' }}>Due today</span>;
  if (days === 1) return <span className="countdown" style={{ color: 'var(--urgent-critical)' }}>1 day left</span>;
  return <span className="countdown">{days} days left</span>;
}

function ScoreBreakdownTip({ breakdown }) {
  const [open, setOpen] = useState(false);
  if (!breakdown) return null;
  return (
    <>
      <button
        className="score-info"
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        aria-label="Score breakdown"
        title="Score breakdown"
      >
        ⓘ
      </button>
      {open && (
        <div className="score-popover" onClick={e => e.stopPropagation()}>
          <div className="score-popover-row"><span>BM25</span><strong>{breakdown.bm25.toFixed(1)}</strong></div>
          <div className="score-popover-row"><span>Embedding</span><strong>{breakdown.embedding.toFixed(1)}</strong></div>
          <div className="score-popover-row"><span>LLM</span><strong>{breakdown.llm.toFixed(1)}</strong></div>
          <div className="score-popover-row final"><span>Final</span><strong>{breakdown.final.toFixed(1)}</strong></div>
        </div>
      )}
    </>
  );
}

export default function EmailCard({ email, onPrepGuide, onGenerateEmail, onExpand }) {
  return (
    <div className="card email-card">
      <div className="email-card-header">
        <div>
          <div className="email-card-subject" onClick={onExpand} style={{ cursor: 'pointer' }}>
            {email.subject}
          </div>
          <div className="email-card-meta">
            <span>{email.organization || email.sender}</span>
            {email.opportunity_type && <span>· {email.opportunity_type}</span>}
          </div>
        </div>
        <span className={`badge badge-${email.urgency}`}>{email.urgency}</span>
      </div>

      <div className="relevance-bar-wrap" style={{ position: 'relative' }}>
        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{email.relevance_score.toFixed(1)}/10</span>
        <div className="relevance-bar">
          <div className="relevance-bar-fill" style={{ width: `${Math.min(100, email.relevance_score * 10)}%` }} />
        </div>
        <ScoreBreakdownTip breakdown={email.score_breakdown} />
        <CountdownText deadline={email.deadline} />
      </div>

      <div className="email-card-summary">{email.relevance_reason || email.summary}</div>

      {email.required_skills.length > 0 && (
        <div className="chips-row">
          {email.required_skills.slice(0, 6).map(s => (
            <span key={s} className="chip" style={{ cursor: 'default' }}>{s}</span>
          ))}
        </div>
      )}

      <div className="email-card-actions">
        <button className="btn btn-ghost btn-sm" onClick={() => onPrepGuide(email)}>Prep Guide</button>
        <button className="btn btn-accent btn-sm" onClick={() => onGenerateEmail(email)}>Generate Email</button>
      </div>
    </div>
  );
}

import React from 'react';

export default function EmailDetail({ email, onClose, onPrepGuide, onGenerateEmail }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
              <span className={`badge badge-${email.urgency}`}>{email.urgency}</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {email.opportunity_type} · Score {email.relevance_score}/10
              </span>
            </div>
            <h2>{email.subject}</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: 6, fontSize: '0.9rem' }}>
              {email.organization} · {email.sender}
            </p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="detail-section">
            <div className="detail-label">Summary</div>
            <p>{email.summary}</p>
          </div>

          <div className="detail-section">
            <div className="detail-label">Why it matches you</div>
            <p>{email.relevance_reason}</p>
          </div>

          {email.action_required && (
            <div className="detail-section">
              <div className="detail-label">Action required</div>
              <p>{email.action_required}</p>
            </div>
          )}

          {email.deadline && (
            <div className="detail-section">
              <div className="detail-label">Deadline</div>
              <p>{email.deadline}</p>
            </div>
          )}

          {email.required_skills.length > 0 && (
            <div className="detail-section">
              <div className="detail-label">Required skills</div>
              <div className="chips-row" style={{ marginTop: 6 }}>
                {email.required_skills.map(s => (
                  <span key={s} className="chip" style={{ cursor: 'default' }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
            <button className="btn btn-ghost" onClick={() => onPrepGuide(email)}>Prep Guide</button>
            <button className="btn btn-accent" onClick={() => onGenerateEmail(email)} style={{ marginLeft: 'auto' }}>
              Generate Email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

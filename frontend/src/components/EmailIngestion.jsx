import React, { useState } from 'react';

const SAMPLE = `Subject: Google STEP Internship 2025 — Applications Open
From: careers@google.com

Hi Students,

Google's STEP program for first and second year undergraduates is open for Summer 2025. 12-week paid program. Required: strong data structures, one programming language (Python/Java/C++), interest in software engineering. Deadline: March 15, 2025. Apply at careers.google.com/step.

---EMAIL---

Subject: 50% OFF Crypto Course — Limited Time!!
From: offers@cryptomasterz.biz

URGENT! Don't miss this chance to become a crypto millionaire! Sign up in 24 hours for exclusive access to our $5000 trading bot for just $49! Click here now!

---EMAIL---

Subject: Hackathon: BuildForGood 2025
From: hello@buildforgood.org

Join 500+ student developers for a 48-hour hackathon focused on social impact. Teams of up to 4. Prizes: $10K total. Tech stack flexible — bring your best ideas in AI, web, mobile. Registration closes Feb 20, 2025.`;

export default function EmailIngestion({ onExtract, loading }) {
  const [text, setText] = useState('');

  function loadSample() {
    setText(SAMPLE);
  }

  function submit() {
    if (!text.trim() || loading) return;
    onExtract(text);
  }

  const count = text.split(/---EMAIL---/g).filter(s => s.trim()).length;

  return (
    <div className="card" style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
        <div>
          <h3>Paste your inbox</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: 4 }}>
            Separate each email with <code style={{ background: 'var(--bg-sunk)', padding: '2px 6px', borderRadius: 4 }}>---EMAIL---</code> on its own line.
          </p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={loadSample} type="button">Load sample</button>
      </div>

      <textarea
        className="textarea"
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Subject: ...&#10;From: ...&#10;&#10;Email body here...&#10;&#10;---EMAIL---&#10;&#10;Subject: ..."
        rows={10}
        disabled={loading}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {text.trim() ? `${count} email${count === 1 ? '' : 's'} detected` : 'No emails yet'}
        </span>
        <button className="btn btn-accent" onClick={submit} disabled={!text.trim() || loading}>
          {loading ? 'Analyzing…' : 'Triage inbox'}
        </button>
      </div>
    </div>
  );
}

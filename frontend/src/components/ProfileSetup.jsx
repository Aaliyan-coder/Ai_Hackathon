import React, { useState } from 'react';

const SUGGESTED_SKILLS = [
  'Python', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'Java', 'C++', 'Go',
  'SQL', 'Data Structures', 'Algorithms', 'System Design', 'Machine Learning',
  'Deep Learning', 'PyTorch', 'TensorFlow', 'AWS', 'Docker', 'Kubernetes',
  'Git', 'REST APIs', 'GraphQL', 'MongoDB', 'PostgreSQL', 'Figma', 'UI/UX'
];

export default function ProfileSetup({ profile, onSave, isEdit = false }) {
  const [form, setForm] = useState({
    name: profile.name || '',
    university: profile.university || '',
    year: profile.year || '',
    targetRole: profile.targetRole || 'all',
    skills: profile.skills || []
  });
  const [skillInput, setSkillInput] = useState('');

  function toggleSkill(s) {
    setForm(f => ({
      ...f,
      skills: f.skills.includes(s) ? f.skills.filter(x => x !== s) : [...f.skills, s]
    }));
  }

  function addFreeSkills() {
    const parts = skillInput.split(',').map(s => s.trim()).filter(Boolean);
    if (!parts.length) return;
    setForm(f => ({ ...f, skills: [...new Set([...f.skills, ...parts])] }));
    setSkillInput('');
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.university || form.skills.length === 0) return;
    onSave(form);
  }

  const confidence = profile.skillConfidence || {};

  return (
    <div className="container container-narrow">
      <div className="hero">
        <div className="hero-eyebrow">{isEdit ? 'Edit profile' : 'Get started'}</div>
        <h1>{isEdit ? 'Your profile' : 'Tell us about you'}</h1>
        <p className="hero-subtitle">
          Everything you enter here gets injected into the AI's context so it can triage, score and tailor to you — not a generic student.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card">
        <div className="field">
          <label>Full name</label>
          <input
            className="input"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Jane Doe"
          />
        </div>

        <div className="field">
          <label>University</label>
          <input
            className="input"
            value={form.university}
            onChange={e => setForm(f => ({ ...f, university: e.target.value }))}
            placeholder="LUMS / IIT Delhi / MIT"
          />
        </div>

        <div className="field">
          <label>Year of study</label>
          <select
            className="select"
            value={form.year}
            onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
          >
            <option value="">Select year</option>
            <option>Freshman</option>
            <option>Sophomore</option>
            <option>Junior</option>
            <option>Senior</option>
            <option>Masters 1</option>
            <option>Masters 2</option>
            <option>PhD</option>
          </select>
        </div>

        <div className="field">
          <label>What are you hunting for?</label>
          <select
            className="select"
            value={form.targetRole}
            onChange={e => setForm(f => ({ ...f, targetRole: e.target.value }))}
          >
            <option value="all">All opportunities</option>
            <option value="internship">Internships</option>
            <option value="job">Full-time jobs</option>
            <option value="competition">Competitions / hackathons</option>
          </select>
        </div>

        <div className="field">
          <label>Skills ({form.skills.length} selected)</label>
          <div className="chips-row" style={{ marginBottom: 10 }}>
            {SUGGESTED_SKILLS.map(s => (
              <span
                key={s}
                className={`chip ${form.skills.includes(s) ? 'selected' : ''}`}
                onClick={() => toggleSkill(s)}
              >
                {s}
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="input"
              placeholder="Add your own (comma-separated)"
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addFreeSkills(); } }}
            />
            <button type="button" className="btn btn-ghost" onClick={addFreeSkills}>Add</button>
          </div>

          {form.skills.length > 0 && (
            <div className="chips-row" style={{ marginTop: 12 }}>
              {form.skills.map(s => (
                <span key={s} className="chip selected" onClick={() => toggleSkill(s)}>
                  {s}
                  {confidence[s] && <em style={{ fontStyle: 'normal', opacity: 0.7, fontSize: '0.72rem' }}>· {confidence[s]}</em>}
                  <span className="chip-close">×</span>
                </span>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={!form.name || !form.university || form.skills.length === 0}
          style={{ width: '100%', marginTop: 12 }}
        >
          {isEdit ? 'Save changes' : 'Continue to dashboard'}
        </button>
      </form>
    </div>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SUGGESTED_SKILLS = [
  'Python', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'Java', 'C++', 'Go',
  'SQL', 'Data Structures', 'Algorithms', 'Machine Learning', 'PyTorch', 'AWS',
  'Docker', 'Git', 'REST APIs', 'MongoDB', 'PostgreSQL', 'Figma', 'UI/UX',
];

const slideVariants = {
  enter: (dir) => ({
    x: dir > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  exit: (dir) => ({
    x: dir > 0 ? -60 : 60,
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' },
  }),
};

function StepDots({ total, current }) {
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 28, justifyContent: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i === current ? 20 : 7,
            height: 7,
            borderRadius: 999,
            background: i === current ? 'var(--accent)' : 'var(--border-strong)',
            transition: 'all 0.25s ease',
          }}
        />
      ))}
    </div>
  );
}

function AccountStep({ form, onChange, onSubmit, error }) {
  return (
    <form onSubmit={onSubmit}>
      <h2>Create account</h2>
      <p style={{ color: 'var(--text-muted)', marginTop: 6, marginBottom: 24, fontSize: '0.92rem' }}>
        Step 1 of 2 · Your login details
      </p>

      {error && <div className="error-box" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="field">
        <label>Full name</label>
        <input
          className="input"
          placeholder="Jane Doe"
          value={form.name}
          onChange={e => onChange('name', e.target.value)}
          autoFocus
        />
      </div>
      <div className="field">
        <label>Email</label>
        <input
          className="input"
          type="email"
          placeholder="you@university.edu"
          value={form.email}
          onChange={e => onChange('email', e.target.value)}
        />
      </div>
      <div className="field" style={{ marginBottom: 24 }}>
        <label>Password</label>
        <input
          className="input"
          type="password"
          placeholder="At least 6 characters"
          value={form.password}
          onChange={e => onChange('password', e.target.value)}
        />
      </div>
      <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
        Continue →
      </button>
    </form>
  );
}

function ProfileStep({ form, onChange, onToggleSkill, onAddSkills, skillInput, onSkillInput, onSubmit, onBack }) {
  return (
    <form onSubmit={onSubmit}>
      <h2>Your profile</h2>
      <p style={{ color: 'var(--text-muted)', marginTop: 6, marginBottom: 24, fontSize: '0.92rem' }}>
        Step 2 of 2 · Help the AI triage for <em>you</em>
      </p>

      <div className="field">
        <label>University</label>
        <input
          className="input"
          placeholder="LUMS / IIT Delhi / MIT"
          value={form.university}
          onChange={e => onChange('university', e.target.value)}
          autoFocus
        />
      </div>

      <div className="field">
        <label>Year of study</label>
        <select
          className="select"
          value={form.year}
          onChange={e => onChange('year', e.target.value)}
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
          onChange={e => onChange('targetRole', e.target.value)}
        >
          <option value="all">All opportunities</option>
          <option value="internship">Internships</option>
          <option value="job">Full-time jobs</option>
          <option value="competition">Competitions / hackathons</option>
        </select>
      </div>

      <div className="field">
        <label>Skills — pick what applies ({form.skills.length} selected)</label>
        <div className="chips-row" style={{ marginBottom: 10 }}>
          {SUGGESTED_SKILLS.map(s => (
            <span
              key={s}
              className={`chip ${form.skills.includes(s) ? 'selected' : ''}`}
              onClick={() => onToggleSkill(s)}
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
            onChange={e => onSkillInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onAddSkills(); } }}
          />
          <button type="button" className="btn btn-ghost" onClick={onAddSkills}>Add</button>
        </div>
        {form.skills.length > 0 && (
          <div className="chips-row" style={{ marginTop: 10 }}>
            {form.skills.map(s => (
              <span key={s} className="chip selected" onClick={() => onToggleSkill(s)}>
                {s} <span className="chip-close">×</span>
              </span>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button
          type="button"
          className="btn btn-ghost"
          style={{ flex: '0 0 auto', padding: '12px 16px' }}
          onClick={onBack}
        >
          ←
        </button>
        <button
          type="submit"
          className="btn btn-accent"
          style={{ flex: 1, padding: '12px' }}
          disabled={!form.university || form.skills.length === 0}
        >
          Get started →
        </button>
      </div>
    </form>
  );
}

export default function AuthPage({ mode, onAuth, onToggle, onBack }) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [error, setError] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    university: '', year: '', targetRole: 'all', skills: [],
  });

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  function toggleSkill(s) {
    setForm(f => ({
      ...f,
      skills: f.skills.includes(s) ? f.skills.filter(x => x !== s) : [...f.skills, s],
    }));
  }

  function addSkills() {
    const parts = skillInput.split(',').map(s => s.trim()).filter(Boolean);
    if (!parts.length) return;
    setForm(f => ({ ...f, skills: [...new Set([...f.skills, ...parts])] }));
    setSkillInput('');
  }

  function handleAccountSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError('Name is required');
    if (!form.email.trim()) return setError('Email is required');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setDir(1);
    setStep(1);
  }

  function handleProfileSubmit(e) {
    e.preventDefault();
    if (!form.university || form.skills.length === 0) return;
    const err = onAuth('signup', form);
    if (err) { setDir(-1); setStep(0); setError(err); }
  }

  function handleSignIn(e) {
    e.preventDefault();
    setError('');
    if (!form.email.trim() || !form.password) return setError('Email and password required');
    const err = onAuth('signin', form);
    if (err) setError(err);
  }

  function goBack() {
    setDir(-1);
    setStep(0);
  }

  return (
    <div className="auth-page">
      <button className="auth-back btn btn-ghost btn-sm" onClick={onBack}>← Back</button>

      <motion.div
        className="auth-card card"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.38, ease: 'easeOut' }}
      >
        <div className="navbar-brand" style={{ marginBottom: 20, justifyContent: 'center' }}>
          <div className="navbar-brand-dot" />
          Inbox Intel
        </div>

        {mode === 'signup' && <StepDots total={2} current={step} />}

        <AnimatePresence mode="wait" custom={dir}>
          {mode === 'signin' ? (
            <motion.div
              key="signin"
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <form onSubmit={handleSignIn}>
                <h2>Welcome back</h2>
                <p style={{ color: 'var(--text-muted)', marginTop: 6, marginBottom: 24, fontSize: '0.92rem' }}>
                  Sign in to continue.
                </p>
                {error && <div className="error-box" style={{ marginBottom: 16 }}>{error}</div>}
                <div className="field">
                  <label>Email</label>
                  <input className="input" type="email" placeholder="you@university.edu"
                    value={form.email} onChange={e => set('email', e.target.value)} autoFocus />
                </div>
                <div className="field" style={{ marginBottom: 24 }}>
                  <label>Password</label>
                  <input className="input" type="password" placeholder="••••••••"
                    value={form.password} onChange={e => set('password', e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
                  Sign in
                </button>
              </form>
            </motion.div>
          ) : step === 0 ? (
            <motion.div
              key="account"
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <AccountStep
                form={form}
                onChange={set}
                onSubmit={handleAccountSubmit}
                error={error}
              />
            </motion.div>
          ) : (
            <motion.div
              key="profile"
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <ProfileStep
                form={form}
                onChange={set}
                onToggleSkill={toggleSkill}
                onAddSkills={addSkills}
                skillInput={skillInput}
                onSkillInput={setSkillInput}
                onSubmit={handleProfileSubmit}
                onBack={goBack}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          {mode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
          <button
            type="button"
            style={{ color: 'var(--accent)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            onClick={() => { setStep(0); setError(''); onToggle(); }}
          >
            {mode === 'signup' ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}

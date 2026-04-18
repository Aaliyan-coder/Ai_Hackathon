import { motion } from 'framer-motion';

const FEATURES = [
  {
    icon: '⚡',
    title: 'Instant Triage',
    desc: 'Paste your inbox dump. Spam filtered, relevance scored, and urgency ranked in seconds using Mistral AI.',
  },
  {
    icon: '🃏',
    title: 'Swipe to Decide',
    desc: 'Tinder-style card deck for quick apply/skip decisions. Keyboard shortcuts included.',
  },
  {
    icon: '🎯',
    title: 'Skill Matching',
    desc: 'Every email scored against your profile. See exactly why an opportunity surfaced — or didn\'t.',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.55, ease: [0.25, 0.1, 0.25, 1] },
  }),
};

export default function LandingPage({ onSignIn, onSignUp }) {
  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="navbar-brand">
          <div className="navbar-brand-dot" />
          Inbox Intel
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost btn-sm" onClick={onSignIn}>Sign in</button>
          <button className="btn btn-primary btn-sm" onClick={onSignUp}>Get started</button>
        </div>
      </nav>

      <section className="landing-hero">
        <motion.p
          className="hero-eyebrow"
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0}
        >
          AI-powered email triage
        </motion.p>

        <motion.h1
          className="landing-headline"
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={1}
        >
          Your inbox,<br />finally intelligent.
        </motion.h1>

        <motion.p
          className="hero-subtitle"
          style={{ maxWidth: 560 }}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={2}
        >
          Stop drowning in opportunity emails. Inbox Intel filters spam, scores relevance,
          and surfaces what actually matters for your career.
        </motion.p>

        <motion.div
          className="landing-ctas"
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={3}
        >
          <button className="btn btn-accent landing-cta-btn" onClick={onSignUp}>
            Get started free →
          </button>
          <button className="btn btn-ghost landing-cta-btn" onClick={onSignIn}>
            Sign in
          </button>
        </motion.div>
      </section>

      <motion.section
        className="landing-features"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        {FEATURES.map((f, i) => (
          <motion.div key={f.title} className="card landing-feature-card" variants={fadeUp} custom={i}>
            <div className="landing-feature-icon">{f.icon}</div>
            <h3 style={{ marginTop: 14 }}>{f.title}</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: 8, fontSize: '0.92rem', lineHeight: 1.6 }}>
              {f.desc}
            </p>
          </motion.div>
        ))}
      </motion.section>

      <footer className="landing-footer">
        <div className="navbar-brand" style={{ opacity: 0.45 }}>
          <div className="navbar-brand-dot" />
          Inbox Intel
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
          Built for ambitious students
        </p>
      </footer>
    </div>
  );
}

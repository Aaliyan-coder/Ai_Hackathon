import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';

function SwipeCard({ email, exitDirRef, onCommit, onExpand }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-280, 280], [-22, 22]);
  const applyOpacity = useTransform(x, [40, 140], [0, 1]);
  const skipOpacity = useTransform(x, [-140, -40], [1, 0]);

  return (
    <motion.div
      className="card swiper-card"
      style={{ x, rotate, position: 'absolute', inset: 0, cursor: 'grab' }}
      custom={exitDirRef}
      variants={{
        initial: { scale: 0.72, opacity: 0 },
        animate: {
          scale: 1,
          opacity: 1,
          transition: { type: 'spring', stiffness: 360, damping: 26 },
        },
        // variant function is called by framer-motion at animation time,
        // after the ref has been set synchronously in commit()
        exit: (ref) => ({
          x: ref.current * 680,
          rotate: ref.current * 28,
          opacity: 0,
          transition: { duration: 0.34, ease: 'easeIn' },
        }),
      }}
      initial="initial"
      animate="animate"
      exit="exit"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      whileDrag={{ cursor: 'grabbing' }}
      onDragEnd={(e, info) => {
        if (info.offset.x > 110) onCommit('apply');
        else if (info.offset.x < -110) onCommit('skip');
      }}
      onClick={() => {
        if (Math.abs(x.get()) < 6) onExpand(email);
      }}
    >
      <motion.div className="swiper-card-overlay apply" style={{ opacity: applyOpacity }}>APPLY</motion.div>
      <motion.div className="swiper-card-overlay skip" style={{ opacity: skipOpacity }}>SKIP</motion.div>

      <div className="email-card-header">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="email-card-subject">{email.subject}</div>
          <div className="email-card-meta">
            <span>{email.organization || email.sender}</span>
            {email.opportunity_type && <span>· {email.opportunity_type}</span>}
          </div>
        </div>
        <span className={`badge badge-${email.urgency}`} style={{ flexShrink: 0 }}>{email.urgency}</span>
      </div>

      <div className="relevance-bar-wrap">
        <span style={{ color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>
          {email.relevance_score}/10
        </span>
        <div className="relevance-bar">
          <div className="relevance-bar-fill" style={{ width: `${email.relevance_score * 10}%` }} />
        </div>
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.55 }}>
        {email.summary}
      </p>

      <div className="detail-section">
        <div className="detail-label">Why it surfaced</div>
        <p style={{ fontSize: '0.88rem' }}>{email.relevance_reason}</p>
      </div>

      {email.required_skills?.length > 0 && (
        <div>
          <div className="detail-label" style={{ marginBottom: 6 }}>Skills needed</div>
          <div className="chips-row">
            {email.required_skills.map(s => (
              <span key={s} className="chip" style={{ cursor: 'default' }}>{s}</span>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: 'auto', paddingTop: 10, color: 'var(--text-soft)', fontSize: '0.78rem', textAlign: 'center' }}>
        Tap card to see full detail
      </div>
    </motion.div>
  );
}

export default function SwiperMode({ emails, onDecision, onExpand }) {
  const [index, setIndex] = useState(0);
  // ref is set synchronously in commit() before setIndex triggers a re-render,
  // so framer-motion reads the correct direction when the exit variant fires
  const exitDirRef = useRef(1);

  const current = emails[index];

  useEffect(() => {
    function handleKey(e) {
      if (!current) return;
      if (e.key === 'ArrowLeft') commit('skip');
      if (e.key === 'ArrowRight') commit('apply');
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  function commit(decision) {
    exitDirRef.current = decision === 'apply' ? 1 : -1;
    onDecision(current, decision);
    setIndex(i => i + 1);
  }

  if (!current) {
    return (
      <div className="swiper-done-wrap">
        <motion.div
          className="swiper-empty card"
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        >
          <h2>All caught up.</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: 10 }}>
            You've swiped through every relevant email. Head back to the dashboard to triage more.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="swiper-stage">
      <div className="swiper-counter">
        {index + 1} of {emails.length}
        <span className="swiper-hint"> · ← skip &nbsp; apply →</span>
      </div>

      <div className="swiper-card-container">
        <AnimatePresence custom={exitDirRef}>
          <SwipeCard
            key={current.id}
            email={current}
            exitDirRef={exitDirRef}
            onCommit={commit}
            onExpand={onExpand}
          />
        </AnimatePresence>
      </div>

      <div className="swiper-controls">
        <button className="swiper-btn skip" onClick={() => commit('skip')} aria-label="Skip">✕</button>
        <button className="swiper-btn apply" onClick={() => commit('apply')} aria-label="Apply">✓</button>
      </div>
    </div>
  );
}

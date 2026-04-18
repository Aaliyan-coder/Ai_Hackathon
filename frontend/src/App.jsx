import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import ProfileSetup from './components/ProfileSetup';
import Dashboard from './components/Dashboard';
import SwiperMode from './components/SwiperMode';
import QuizMe from './components/QuizMe';
import SkillDetector from './components/SkillDetector';
import PrepGuide from './components/PrepGuide';
import EmailGenerator from './components/EmailGenerator';
import EmailDetail from './components/EmailDetail';
import { useProfile } from './hooks/useProfile';
import { useTheme } from './hooks/useTheme';
import { useAuth } from './hooks/useAuth';
import { extractEmails, healthCheck } from './api/client';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

export default function App() {
  const { profile, updateProfile, addSkills, setSkillConfidence, isComplete } = useProfile();
  const { theme, toggle } = useTheme();
  const { user, signUp, signIn, signOut } = useAuth();

  const [screen, setScreen] = useState(() => (user ? 'app' : 'landing'));
  const [authMode, setAuthMode] = useState('signin');
  const [view, setView] = useState('dashboard');
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [batchProgress, setBatchProgress] = useState(null);
  const [error, setError] = useState(null);
  const [lastRaw, setLastRaw] = useState('');
  const [prepFor, setPrepFor] = useState(null);
  const [genFor, setGenFor] = useState(null);
  const [detailFor, setDetailFor] = useState(null);
  const [decisions, setDecisions] = useState({});
  const [backendUp, setBackendUp] = useState(null);

  useEffect(() => {
    if (user) setScreen('app');
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      const ok = await healthCheck();
      if (!cancelled) setBackendUp(ok);
    }
    check();
    const interval = setInterval(check, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  async function handleExtract(raw) {
    setLastRaw(raw);
    setLoading(true);
    setError(null);
    setBatchProgress(null);
    setEmails([]);
    try {
      const result = await extractEmails(raw, profile, (current, total) => {
        setBatchProgress({ current, total });
      });
      setEmails(result);
    } catch (e) {
      setError(e.message || 'Extraction failed');
    } finally {
      setLoading(false);
      setBatchProgress(null);
    }
  }

  function handleRetry() {
    if (lastRaw) handleExtract(lastRaw);
  }

  function handleDecision(email, decision) {
    setDecisions(d => ({ ...d, [email.id]: decision }));
  }

  function handleAuth(mode, form) {
    if (mode === 'signup') {
      const err = signUp({ name: form.name.trim(), email: form.email, password: form.password });
      if (!err) {
        updateProfile({
          name: form.name,
          university: form.university,
          year: form.year,
          targetRole: form.targetRole || 'all',
          skills: form.skills || [],
        });
        setScreen('app');
      }
      return err;
    } else {
      const err = signIn({ email: form.email, password: form.password });
      if (!err) setScreen('app');
      return err;
    }
  }

  function handleSignOut() {
    signOut();
    setEmails([]);
    setDecisions({});
    setView('dashboard');
    setScreen('landing');
  }

  if (screen === 'landing') {
    return (
      <motion.div key="landing" {...pageVariants} initial="initial" animate="animate" exit="exit">
        <LandingPage
          onSignIn={() => { setAuthMode('signin'); setScreen('auth'); }}
          onSignUp={() => { setAuthMode('signup'); setScreen('auth'); }}
        />
      </motion.div>
    );
  }

  if (screen === 'auth') {
    return (
      <motion.div key="auth" {...pageVariants} initial="initial" animate="animate" exit="exit">
        <AuthPage
          mode={authMode}
          onAuth={handleAuth}
          onToggle={() => setAuthMode(m => m === 'signin' ? 'signup' : 'signin')}
          onBack={() => setScreen('landing')}
        />
      </motion.div>
    );
  }

  if (!isComplete) {
    return (
      <div className="app">
        <Navbar
          current="profile"
          onNavigate={() => {}}
          theme={theme}
          onToggleTheme={toggle}
          backendUp={backendUp}
          onSignOut={handleSignOut}
        />
        <ProfileSetup profile={profile} onSave={updateProfile} />
      </div>
    );
  }

  const swiperEmails = emails.filter(e => e.classification === 'relevant' && e.relevance_score >= 5);
  const batchStatusMsg = batchProgress
    ? `Processing batch ${batchProgress.current} of ${batchProgress.total}…`
    : null;

  return (
    <div className="app">
      <Navbar
        current={view}
        onNavigate={setView}
        theme={theme}
        onToggleTheme={toggle}
        backendUp={backendUp}
        onSignOut={handleSignOut}
      />

      <AnimatePresence mode="wait">
        {view === 'dashboard' && (
          <motion.div key="dashboard" {...pageVariants} initial="initial" animate="animate" exit="exit">
            <Dashboard
              emails={emails}
              loading={loading}
              batchStatus={batchStatusMsg}
              error={error}
              onExtract={handleExtract}
              onRetry={handleRetry}
              onPrepGuide={setPrepFor}
              onGenerateEmail={setGenFor}
              onExpand={setDetailFor}
            />
          </motion.div>
        )}

        {view === 'swiper' && (
          <motion.div key="swiper" {...pageVariants} initial="initial" animate="animate" exit="exit">
            {swiperEmails.length === 0 ? (
              <div className="container">
                <div className="empty-state card">
                  <h2>Nothing to swipe.</h2>
                  <p style={{ marginTop: 10 }}>Triage some emails from the dashboard first.</p>
                  <button className="btn btn-accent" style={{ marginTop: 16 }} onClick={() => setView('dashboard')}>
                    Go to dashboard
                  </button>
                </div>
              </div>
            ) : (
              <SwiperMode
                emails={swiperEmails}
                onDecision={handleDecision}
                onExpand={setDetailFor}
              />
            )}
          </motion.div>
        )}

        {view === 'quiz' && (
          <motion.div key="quiz" {...pageVariants} initial="initial" animate="animate" exit="exit">
            <QuizMe profile={profile} onConfidence={setSkillConfidence} />
          </motion.div>
        )}

        {view === 'detector' && (
          <motion.div key="detector" {...pageVariants} initial="initial" animate="animate" exit="exit">
            <SkillDetector profile={profile} onAddSkills={addSkills} />
          </motion.div>
        )}

        {view === 'profile' && (
          <motion.div key="profile" {...pageVariants} initial="initial" animate="animate" exit="exit">
            <ProfileSetup profile={profile} onSave={updateProfile} isEdit />
          </motion.div>
        )}
      </AnimatePresence>

      {prepFor && (
        <PrepGuide email={prepFor} profile={profile} onClose={() => setPrepFor(null)} />
      )}
      {genFor && (
        <EmailGenerator email={genFor} profile={profile} onClose={() => setGenFor(null)} />
      )}
      {detailFor && (
        <EmailDetail
          email={detailFor}
          onClose={() => setDetailFor(null)}
          onPrepGuide={(e) => { setDetailFor(null); setPrepFor(e); }}
          onGenerateEmail={(e) => { setDetailFor(null); setGenFor(e); }}
        />
      )}
    </div>
  );
}

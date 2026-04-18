import React, { useState } from 'react';
import { generateQuiz, gradeQuiz } from '../api/client';

export default function QuizMe({ profile, onConfidence }) {
  const [skill, setSkill] = useState(profile.skills[0] || '');
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [grading, setGrading] = useState(false);
  const [error, setError] = useState(null);

  async function start() {
    if (!skill) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setAnswers({});
    try {
      const q = await generateQuiz(skill);
      setQuiz(q);
    } catch (e) {
      setError(e.message || 'Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  }

  async function submit() {
    if (!quiz) return;
    setGrading(true);
    setError(null);
    try {
      const r = await gradeQuiz(skill, quiz.questions, answers);
      setResult(r);
      if (r.confidence) onConfidence(skill, r.confidence);
    } catch (e) {
      setError(e.message || 'Grading failed');
    } finally {
      setGrading(false);
    }
  }

  function reset() {
    setQuiz(null);
    setAnswers({});
    setResult(null);
    setError(null);
  }

  if (profile.skills.length === 0) {
    return (
      <div className="container container-narrow">
        <div className="empty-state card">
          <h2>Add skills first</h2>
          <p style={{ marginTop: 10 }}>Head to your profile and pick at least one skill to quiz yourself on.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container container-narrow">
      <div className="hero">
        <div className="hero-eyebrow">Quiz Me</div>
        <h1>Stress-test your skills.</h1>
        <p className="hero-subtitle">
          Pick a skill, get five AI-generated questions, and walk away with a confidence tag that sticks to your profile.
        </p>
      </div>

      {!quiz && !result && (
        <div className="card">
          <div className="field">
            <label>Pick a skill</label>
            <select className="select" value={skill} onChange={e => setSkill(e.target.value)}>
              {profile.skills.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <button className="btn btn-accent" onClick={start} disabled={loading || !skill}>
            {loading ? 'Generating…' : 'Start quiz'}
          </button>
          {error && <div className="error-box" style={{ marginTop: 14 }}><span>{error}</span></div>}
        </div>
      )}

      {quiz && !result && (
        <>
          <div style={{ marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>{skill} · {quiz.questions.length} questions</h3>
            <button className="btn btn-ghost btn-sm" onClick={reset}>Start over</button>
          </div>

          {quiz.questions.map((q, i) => (
            <div key={q.id} className="quiz-question">
              <div className="quiz-question-text">{i + 1}. {q.question}</div>
              {q.type === 'mcq' ? (
                <div className="quiz-options">
                  {q.options.map((opt, j) => (
                    <button
                      key={j}
                      className={`quiz-option ${answers[q.id] === j ? 'selected' : ''}`}
                      onClick={() => setAnswers(a => ({ ...a, [q.id]: j }))}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : (
                <textarea
                  className="textarea"
                  value={answers[q.id] || ''}
                  onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
                  placeholder="Your answer…"
                  rows={3}
                  style={{ fontFamily: 'inherit', fontSize: '0.92rem' }}
                />
              )}
            </div>
          ))}

          {error && <div className="error-box"><span>{error}</span></div>}

          <button className="btn btn-accent" onClick={submit} disabled={grading} style={{ width: '100%', marginTop: 8 }}>
            {grading ? 'Grading…' : 'Submit for grading'}
          </button>
        </>
      )}

      {result && (
        <>
          <div className="score-hero">
            <div className="score-big">{result.score}/{result.max_score}</div>
            <div className="score-label">{skill}</div>
            <div className="confidence-tag">{result.confidence}</div>
          </div>

          {result.overall_feedback && (
            <div className="card" style={{ marginBottom: 18 }}>
              <div className="detail-label">Overall</div>
              <p style={{ marginTop: 6 }}>{result.overall_feedback}</p>
            </div>
          )}

          {quiz.questions.map((q, i) => {
            const perQ = result.per_question?.find(p => p.id === q.id);
            const studentAns = answers[q.id];
            return (
              <div key={q.id} className="quiz-question">
                <div className="quiz-question-text">{i + 1}. {q.question}</div>
                {q.type === 'mcq' ? (
                  <div className="quiz-options">
                    {q.options.map((opt, j) => {
                      let cls = 'quiz-option';
                      if (j === q.correct_index) cls += ' correct';
                      else if (j === studentAns) cls += ' incorrect';
                      return <div key={j} className={cls}>{opt}</div>;
                    })}
                  </div>
                ) : (
                  <div className="quiz-option" style={{ cursor: 'default', whiteSpace: 'pre-wrap' }}>
                    {studentAns || '(no answer)'}
                  </div>
                )}
                {perQ?.feedback && <div className="quiz-feedback">{perQ.feedback}</div>}
              </div>
            );
          })}

          <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
            <button className="btn btn-ghost" onClick={reset}>New quiz</button>
            <button className="btn btn-accent" onClick={start} style={{ marginLeft: 'auto' }}>
              Retry {skill}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

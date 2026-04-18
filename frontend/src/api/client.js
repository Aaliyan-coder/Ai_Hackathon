const BASE = import.meta.env.VITE_API_BASE || '';
const BATCH_SIZE = 5;

async function postJson(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      if (err.detail) detail = err.detail;
    } catch {}
    throw new Error(detail);
  }
  return res.json();
}

function toApiProfile(p) {
  return {
    name: p.name,
    university: p.university,
    year: p.year || '',
    target_role: p.targetRole || 'all',
    skills: p.skills || [],
  };
}

export async function extractEmails(raw, profile, onBatchProgress) {
  const parts = raw
    .split(/^---EMAIL---\s*$/m)
    .map(s => s.trim())
    .filter(Boolean);

  if (parts.length === 0) return [];

  const batches = [];
  for (let i = 0; i < parts.length; i += BATCH_SIZE) {
    batches.push(parts.slice(i, i + BATCH_SIZE));
  }

  let all = [];
  for (let i = 0; i < batches.length; i++) {
    onBatchProgress?.(i + 1, batches.length);
    const batchRaw = batches[i].join('\n---EMAIL---\n');
    const data = await postJson('/api/triage/extract', {
      raw: batchRaw,
      profile: toApiProfile(profile),
    });
    all = all.concat(data.emails || []);
  }
  return all;
}

export async function generatePrepGuide(email, profile) {
  return postJson('/api/assist/prep-guide', { email, profile: toApiProfile(profile) });
}

export async function generateApplicationEmail(email, profile) {
  const data = await postJson('/api/assist/email-gen', { email, profile: toApiProfile(profile) });
  return data.draft;
}

export async function detectSkills(text, profile) {
  return postJson('/api/assist/skill-detect', { text, profile: toApiProfile(profile) });
}

export async function generateQuiz(skill) {
  return postJson('/api/quiz/generate', { skill });
}

export async function gradeQuiz(skill, questions, answers) {
  return postJson('/api/quiz/grade', { skill, questions, answers });
}

export async function healthCheck() {
  try {
    const res = await fetch(`${BASE}/api/health`);
    return res.ok;
  } catch {
    return false;
  }
}

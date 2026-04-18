EXAMPLE = {
    "id": "em_sample_1",
    "subject": "Summer 2026 SWE Internship — Applications Open",
    "sender": "careers@stripe.com",
    "organization": "Stripe",
    "deadline": "2026-05-15",
    "opportunity_type": "internship",
    "required_skills": ["JavaScript", "React", "Node.js", "Data Structures"],
    "summary": "Stripe is accepting applications for their 12-week summer SWE internship. Requires CS undergrads, strong coding fundamentals, web stack experience.",
    "llm_relevance_score": 9,
    "relevance_reason": "Target role matches (internship); required skills overlap heavily with profile (JavaScript, React).",
    "urgency": "high",
    "action_required": "Submit resume and 1-page SOP via careers.stripe.com/internships",
    "classification": "relevant",
}


def build_extraction_prompt(emails: list[str], profile, today: str) -> str:
    import json

    profile_block = f"""STUDENT PROFILE:
- Name: {profile.name}
- University: {profile.university}
- Year: {profile.year}
- Target role: {profile.target_role}
- Skills: {', '.join(profile.skills) or '(none listed)'}"""

    emails_block = "\n\n".join(f"--- EMAIL {i + 1} ---\n{body}" for i, body in enumerate(emails))

    return f"""You are an expert email triage agent for university students hunting for opportunities. Today's date is {today}.

{profile_block}

For each email, extract structured data and score relevance against the profile.

CLASSIFICATION:
- "relevant": concrete opportunity (internship, job, competition, workshop, scholarship) matching the student's skills or target role.
- "irrelevant": legitimate but unrelated to the student's goals (receipts, utility bills, newsletters, unrelated promotions).
- "spam" will be handled separately by another system — do not mark emails as spam here, pick relevant or irrelevant only.

LLM RELEVANCE SCORE (0-10, honest):
- 9-10: target role matches AND 2+ required skills overlap.
- 7-8: target role matches OR heavy skill overlap.
- 5-6: some overlap, still worth surfacing.
- 1-4: weak or tangential.
- 0: zero connection.

URGENCY — your judgment, not mechanical from the deadline alone. Factor in deadline distance, application complexity, and selectivity:
- "critical": deadline within ~3 days, OR within a week for highly competitive/slow-prep opportunities (research programs, scholarships requiring recs).
- "high": deadline within ~1-2 weeks, OR further out but requires extensive prep.
- "medium": deadline within ~1 month with reasonable prep time.
- "low": deadline far away, no deadline stated, or low-stakes opportunity.

SCHEMA (one object per email, preserve order):
{{
  "id": "string (unique)",
  "subject": "string",
  "sender": "string",
  "organization": "string",
  "deadline": "YYYY-MM-DD or null",
  "opportunity_type": "internship | job | competition | workshop | scholarship | other",
  "required_skills": ["string", ...],
  "summary": "string, 1-2 sentences",
  "llm_relevance_score": 0-10,
  "relevance_reason": "string, max 2 sentences",
  "urgency": "critical | high | medium | low",
  "action_required": "string, concrete next step",
  "classification": "relevant | irrelevant"
}}

EXAMPLE VALID OBJECT:
{json.dumps(EXAMPLE, indent=2)}

EMAILS TO PROCESS ({len(emails)} total):
{emails_block}

Return a JSON object with a single key "emails" holding the array. No prose, no markdown fences."""

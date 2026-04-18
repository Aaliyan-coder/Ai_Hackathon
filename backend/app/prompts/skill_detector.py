def build_skill_detector_prompt(text: str, profile) -> str:
    return f"""Analyze the text below (job description, posting, or bio) and extract technical/professional skills. Compare against the student's profile and identify gaps.

STUDENT CURRENT SKILLS: {', '.join(profile.skills) or '(none)'}

TEXT TO ANALYZE:
\"\"\"
{text}
\"\"\"

SCHEMA:
{{
  "detected_skills": ["string", ...],
  "matched": ["string", ...],
  "missing": ["string", ...],
  "suggested_additions": ["string", ...],
  "notes": "string, 1-2 sentences on what the student should prioritize"
}}

- "detected_skills": every concrete skill in the text.
- "matched": skills the student already has (case-insensitive match).
- "missing": detected skills the student lacks.
- "suggested_additions": skills from the profile or adjacent that the text implies but doesn't state literally. Be conservative.

Return ONLY the JSON."""

def build_prep_guide_prompt(email, profile) -> str:
    return f"""You are a senior engineering mentor building a prep plan for a university student.

STUDENT:
- Year: {profile.year}
- Current skills: {', '.join(profile.skills) or '(none)'}
- Target role: {profile.target_role}

OPPORTUNITY:
- Type: {email.opportunity_type}
- Organization: {email.organization}
- Required skills from posting: {', '.join(email.required_skills) or '(unspecified)'}
- Summary: {email.summary}
- Deadline: {email.deadline or 'none'}

Produce a structured prep guide. Group topics into these categories (omit empty ones):
- "DSA" (algorithms & data structures)
- "OOP" (design principles, SOLID, patterns)
- "System Design"
- "Domain Knowledge" (frameworks, ML, finance, etc. specific to this role)
- "Soft Skills" (behavioral, situational prep)

For each topic give difficulty ("Beginner" | "Intermediate" | "Advanced") and estimated hours (integer).

Weigh topics against what the student ALREADY knows. Focus on gaps.

SCHEMA:
{{
  "timeline": "string, e.g. '2 weeks at 8 hrs/week, prioritize X in week 1'",
  "categories": {{
    "DSA": [{{"topic": "string", "difficulty": "Beginner|Intermediate|Advanced", "hours": 0}}],
    "OOP": [...],
    "System Design": [...],
    "Domain Knowledge": [...],
    "Soft Skills": [...]
  }}
}}

Return ONLY the JSON object."""

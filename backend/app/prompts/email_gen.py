def build_email_gen_prompt(email, profile) -> str:
    return f"""Draft a concise application email from the student to the organization. Tone: warm, confident, direct — not over-eager, not corporate.

STUDENT:
- Name: {profile.name}
- University: {profile.university}, Year: {profile.year}
- Skills: {', '.join(profile.skills)}
- Target: {profile.target_role}

OPPORTUNITY:
- Subject: {email.subject}
- Organization: {email.organization}
- Type: {email.opportunity_type}
- Required skills: {', '.join(email.required_skills) or '(not specified)'}
- Summary: {email.summary}
- Action required: {email.action_required}

Rules:
- Open with a specific reference to the role and org.
- Middle: 2-3 sentences tying the student's strongest matching skills to what the role needs. Concrete, no vague claims.
- Close with a clear ask (interview, next steps, resume attached).
- Max 160 words body.
- Include a "Subject: ..." line at the top, blank line, then body.
- No em-dashes. No exclamation marks. Do not fabricate project names or GPAs.

Return ONLY the email text."""

def build_quiz_prompt(skill: str) -> str:
    return f"""Generate a 5-question quiz to assess a university student's competence in "{skill}".

Mix: 3 multiple-choice (MCQ) and 2 short-answer. Questions should probe understanding, not trivia. Range from foundational to moderately advanced.

SCHEMA:
{{
  "skill": "{skill}",
  "questions": [
    {{"id": "q1", "type": "mcq", "question": "string", "options": ["A ...", "B ...", "C ...", "D ..."], "correct_index": 0}},
    {{"id": "q4", "type": "short", "question": "string", "model_answer": "string, 1-3 sentences"}}
  ]
}}

Return ONLY the JSON."""


def build_grade_prompt(skill: str, questions: list, answers: dict) -> str:
    lines = []
    for i, q in enumerate(questions):
        a = answers.get(q.id)
        if q.type == "mcq":
            opts = " | ".join(f"[{j}] {o}" for j, o in enumerate(q.options))
            chosen = f"[{a}] {q.options[a]}" if isinstance(a, int) and 0 <= a < len(q.options) else "(no answer)"
            lines.append(
                f"Q{i + 1} (MCQ): {q.question}\nOptions: {opts}\nCorrect index: {q.correct_index}\nStudent chose: {chosen}"
            )
        else:
            lines.append(
                f"Q{i + 1} (Short): {q.question}\nModel answer: {q.model_answer}\nStudent answer: {a or '(no answer)'}"
            )
    body = "\n\n".join(lines)

    return f"""Grade this student's quiz on "{skill}". Fair but rigorous — partial credit for short answers showing correct reasoning but missing detail.

QUESTIONS AND ANSWERS:
{body}

SCHEMA:
{{
  "score": 0,
  "max_score": {len(questions)},
  "confidence": "Beginner | Intermediate | Strong",
  "per_question": [
    {{"id": "q1", "correct": true, "feedback": "string, 1-2 sentences"}}
  ],
  "overall_feedback": "string, 2-3 sentences on strengths and #1 thing to study next"
}}

Confidence mapping: 0-2 = Beginner, 3-4 = Intermediate, 5 = Strong (only if all MCQs correct AND short answers show real understanding).

Return ONLY the JSON."""

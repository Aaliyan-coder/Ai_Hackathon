from typing import Optional, Literal
from pydantic import BaseModel, Field


class Profile(BaseModel):
    name: str
    university: str
    year: str = ""
    target_role: str = "all"
    skills: list[str] = Field(default_factory=list)


class ExtractRequest(BaseModel):
    raw: str
    profile: Profile


class ScoreBreakdown(BaseModel):
    bm25: float
    embedding: float
    llm: float
    final: float


class EmailItem(BaseModel):
    id: str
    subject: str
    sender: str = ""
    organization: str = ""
    deadline: Optional[str] = None
    opportunity_type: str = "other"
    required_skills: list[str] = Field(default_factory=list)
    summary: str = ""
    relevance_score: float = 0.0
    relevance_reason: str = ""
    urgency: Literal["critical", "high", "medium", "low"] = "low"
    action_required: str = ""
    is_spam: bool = False
    spam_confidence: float = 0.0
    classification: Literal["relevant", "irrelevant", "spam"] = "relevant"
    score_breakdown: Optional[ScoreBreakdown] = None


class ExtractResponse(BaseModel):
    emails: list[EmailItem]


class PrepGuideRequest(BaseModel):
    email: EmailItem
    profile: Profile


class EmailGenRequest(BaseModel):
    email: EmailItem
    profile: Profile


class EmailGenResponse(BaseModel):
    draft: str


class QuizRequest(BaseModel):
    skill: str


class QuizQuestion(BaseModel):
    id: str
    type: Literal["mcq", "short"]
    question: str
    options: list[str] = Field(default_factory=list)
    correct_index: Optional[int] = None
    model_answer: Optional[str] = None


class Quiz(BaseModel):
    skill: str
    questions: list[QuizQuestion]


class QuizGradeRequest(BaseModel):
    skill: str
    questions: list[QuizQuestion]
    answers: dict[str, str | int]


class QuizGradeResult(BaseModel):
    score: int
    max_score: int
    confidence: Literal["Beginner", "Intermediate", "Strong"]
    per_question: list[dict]
    overall_feedback: str


class SkillDetectRequest(BaseModel):
    text: str
    profile: Profile


class SkillDetectResponse(BaseModel):
    detected_skills: list[str]
    matched: list[str]
    missing: list[str]
    suggested_additions: list[str]
    notes: str = ""

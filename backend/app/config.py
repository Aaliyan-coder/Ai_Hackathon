from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    mistral_api_key: str = ""
    mistral_model_heavy: str = "mistral-large-latest"
    mistral_model_light: str = "mistral-small-latest"

    spam_model_name: str = "mrm8488/bert-tiny-finetuned-sms-spam-detection"
    embedding_model_name: str = "sentence-transformers/all-MiniLM-L6-v2"

    bm25_weight: float = 0.25
    embed_weight: float = 0.35
    llm_weight: float = 0.40

    cors_origins: str = "http://localhost:5173"


settings = Settings()

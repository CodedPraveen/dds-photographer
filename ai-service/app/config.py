
import os


class Settings:
    APP_NAME = os.getenv("APP_NAME", "DDS AI Service")
    APP_ENV = os.getenv("APP_ENV", "development")
    API_PREFIX = "/api/v1"


settings = Settings()
from fastapi import FastAPI

from app.core.settings import get_settings

settings = get_settings()

app = FastAPI(title=settings.app_name, version=settings.app_version)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host=settings.host, port=settings.port)

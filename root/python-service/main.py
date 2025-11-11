from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from routes import router as sessions_router


app = FastAPI()

origins = [
        "http://localhost:3000",  # React app's URL
    ]

app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(sessions_router, prefix="/sessions")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
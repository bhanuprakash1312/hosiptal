from fastapi import FastAPI
from app.routes import auth , master , appointments, dashboard, conversation, admin
from fastapi.middleware.cors import CORSMiddleware

from fastapi.responses import JSONResponse
from fastapi import Request
import traceback

app = FastAPI(
    title="Hospital Booking Management System",
    debug=True  # Enables detailed error pages in the browser
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "message": "Internal Server Error",
            "error": str(exc),
            "traceback": traceback.format_exc()
        },
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(master.router)
app.include_router(appointments.router)
app.include_router(dashboard.router)
app.include_router(conversation.router)
app.include_router(admin.router)

@app.get("/")
async def read_root():
    return {"message": "Welcome to the Hospital Booking Management System API"}

from fastapi.responses import JSONResponse
from fastapi import Request
import traceback

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "message": "Internal Server Error",
            "error": str(exc),
            "traceback": traceback.format_exc()
        },
    )
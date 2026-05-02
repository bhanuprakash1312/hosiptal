from fastapi import FastAPI
from app.routes import auth , master , appointments, dashboard, conversation, admin
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Hospital Booking Management System")

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
# MediCare — Patient Admission Management App

A full-stack hospital patient admission management system built for the DScribe Software Engineer Intern Round 1 Task.

## Live Demo
- **Live Application:** <YOUR_FRONTEND_LIVE_URL>
- **Backend API Docs (Swagger):** <YOUR_BACKEND_LIVE_URL>/docs

## Tech Stack
- **Frontend:** React.js (Vite), Axios, Lucide React Icons, Custom Responsive CSS
- **Backend:** Python, FastAPI, Uvicorn, Pydantic (Server-side validation)
- **Database:** SQLite with SQLAlchemy ORM (Persistent storage across server restarts)

## Features
- Add, view, edit, discharge, and delete patient admission records (with confirmation)
- Real-time search by patient name and filtering by Ward, Department, Doctor, and Status
- Client-side and server-side validation (letters-only name, age 0–120, required dropdowns, non-future admission date)
- Responsive layout across mobile, tablet, and desktop

## Steps to Run Locally

### 1. Clone the Repository
```bash
git clone [https://github.com/dhoblesakshi19/patient-admission-management.git](https://github.com/dhoblesakshi19/patient-admission-management.git)
cd patient-admission-management
```

### 2. Start the Backend (FastAPI)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
Backend runs at `http://127.0.0.1:8000` (Swagger UI at `http://127.0.0.1:8000/docs`).

### 3. Start the Frontend (React)
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`.

## Screenshots
*(Add screenshots of your Dashboard, Add/Edit Patient Modal, and Mobile view here)*

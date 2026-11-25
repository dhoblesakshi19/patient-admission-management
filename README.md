# MediCare — Patient Admission Management App

A full-stack hospital patient admission management system built for the DScribe Software Engineer Intern Round 1 Task.

## Live Demo
- **Live Application:** https://patient-admission-management-mocha.vercel.app
- **Backend API Docs (Swagger):** https://medicare-patient-api.onrender.com/docs

## Tech Stack
- **Frontend:** React.js (Vite), Axios, Lucide React Icons, Custom Responsive CSS
- **Backend:** Python, FastAPI, Uvicorn, Pydantic (Server-side validation)
- **Database:** SQLite with SQLAlchemy ORM (Persistent storage across server restarts)

## Features
- Add, view, edit, discharge, and delete patient admission records (with confirmation)
- Real-time search by patient name and filtering by Ward, Department, Doctor, and Status
- Client-side and server-side validation (letters-only name, age 0–120, required dropdowns, non-future admission date)
- Responsive layout across mobile, tablet, and desktop

## Screenshots

### Hospital Dashboard
![Hospital Dashboard](screenshots/dashboard.png)

### Add / Edit Patient Modal
![Add Patient Modal](screenshots/add-patient-modal.png)

## Steps to Run Locally

### 1. Clone the Repository
```bash
git clone [https://github.com/dhoblesakshi19/patient-admission-management.git](https://github.com/dhoblesakshi19/patient-admission-management.git)
cd patient-admission-management
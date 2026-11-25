from datetime import date
import re
from typing import Literal, Optional

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from sqlalchemy import Column, Integer, String, create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker

DATABASE_URL = "sqlite:///./patients.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

ALLOWED_GENDERS = {"Male", "Female", "Other"}
ALLOWED_WARDS = {"General Ward", "ICU", "Emergency", "Private Ward"}
ALLOWED_DEPARTMENTS = {
    "Cardiology",
    "Neurology",
    "Orthopedics",
    "Pediatrics",
    "General Medicine",
}
ALLOWED_DOCTORS = {
    "Dr. Sharma",
    "Dr. Mehta",
    "Dr. Patel",
    "Dr. Verma",
    "Dr. Singh",
}


class PatientDB(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String, nullable=False)
    ward = Column(String, nullable=False)
    department = Column(String, nullable=False)
    doctor = Column(String, nullable=False)
    admissionDate = Column(String, nullable=False)
    status = Column(String, nullable=False, default="Admitted")


Base.metadata.create_all(bind=engine)


class PatientSchema(BaseModel):
    name: str
    age: int
    gender: str
    ward: str
    department: str
    doctor: str
    admissionDate: str
    status: Literal["Admitted", "Discharged"] = "Admitted"

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        cleaned = v.strip()
        if not cleaned or not re.fullmatch(r"[A-Za-z ]+", cleaned):
            raise ValueError("Name is required and must contain letters and spaces only.")
        return cleaned

    @field_validator("age")
    @classmethod
    def validate_age(cls, v: int) -> int:
        if v < 0 or v > 120:
            raise ValueError("Age must be a number between 0 and 120.")
        return v

    @field_validator("gender")
    @classmethod
    def validate_gender(cls, v: str) -> str:
        if v not in ALLOWED_GENDERS:
            raise ValueError("Please select a valid gender from the list.")
        return v

    @field_validator("ward")
    @classmethod
    def validate_ward(cls, v: str) -> str:
        if v not in ALLOWED_WARDS:
            raise ValueError("Please select a valid ward from the list.")
        return v

    @field_validator("department")
    @classmethod
    def validate_department(cls, v: str) -> str:
        if v not in ALLOWED_DEPARTMENTS:
            raise ValueError("Please select a valid department from the list.")
        return v

    @field_validator("doctor")
    @classmethod
    def validate_doctor(cls, v: str) -> str:
        if v not in ALLOWED_DOCTORS:
            raise ValueError("Please select a valid doctor from the list.")
        return v

    @field_validator("admissionDate")
    @classmethod
    def validate_admission_date(cls, v: str) -> str:
        try:
            parsed = date.fromisoformat(v)
        except ValueError:
            raise ValueError("Admission date must be in YYYY-MM-DD format.")
        if parsed > date.today():
            raise ValueError("Admission date cannot be in the future.")
        return v


class PatientResponse(PatientSchema):
    id: int

    class Config:
        from_attributes = True


app = FastAPI(title="MediCare Patient Admission API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.on_event("startup")
def seed_initial_data():
    db = SessionLocal()
    try:
        if db.query(PatientDB).count() == 0:
            sample_patients = [
                PatientDB(
                    name="Rahul Jain",
                    age=25,
                    gender="Male",
                    ward="General Ward",
                    department="Cardiology",
                    doctor="Dr. Sharma",
                    admissionDate="2026-11-24",
                    status="Admitted",
                ),
                PatientDB(
                    name="Priya Sharma",
                    age=32,
                    gender="Female",
                    ward="ICU",
                    department="Neurology",
                    doctor="Dr. Mehta",
                    admissionDate="2026-11-22",
                    status="Admitted",
                ),
                PatientDB(
                    name="Amit Patel",
                    age=45,
                    gender="Male",
                    ward="Private Ward",
                    department="Orthopedics",
                    doctor="Dr. Patel",
                    admissionDate="2026-11-20",
                    status="Discharged",
                ),
                PatientDB(
                    name="Neha Verma",
                    age=28,
                    gender="Female",
                    ward="Emergency",
                    department="Pediatrics",
                    doctor="Dr. Verma",
                    admissionDate="2026-11-25",
                    status="Admitted",
                ),
            ]
            db.add_all(sample_patients)
            db.commit()
    finally:
        db.close()


@app.get("/patients", response_model=list[PatientResponse])
def get_patients(
    ward: Optional[str] = None,
    department: Optional[str] = None,
    doctor: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(PatientDB)
    if ward:
        query = query.filter(PatientDB.ward == ward)
    if department:
        query = query.filter(PatientDB.department == department)
    if doctor:
        query = query.filter(PatientDB.doctor == doctor)
    if search:
        query = query.filter(PatientDB.name.ilike(f"%{search}%"))
    return query.order_by(PatientDB.id.desc()).all()


@app.get("/patients/{patient_id}", response_model=PatientResponse)
def get_patient(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(PatientDB).filter(PatientDB.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


@app.post("/patients", response_model=PatientResponse, status_code=201)
def create_patient(payload: PatientSchema, db: Session = Depends(get_db)):
    new_patient = PatientDB(**payload.model_dump())
    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)
    return new_patient


@app.put("/patients/{patient_id}", response_model=PatientResponse)
def update_patient(patient_id: int, payload: PatientSchema, db: Session = Depends(get_db)):
    patient = db.query(PatientDB).filter(PatientDB.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    for key, value in payload.model_dump().items():
        setattr(patient, key, value)
    db.commit()
    db.refresh(patient)
    return patient


@app.patch("/patients/{patient_id}/discharge", response_model=PatientResponse)
def discharge_patient(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(PatientDB).filter(PatientDB.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    patient.status = "Discharged"
    db.commit()
    db.refresh(patient)
    return patient


@app.delete("/patients/{patient_id}")
def delete_patient(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(PatientDB).filter(PatientDB.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    db.delete(patient)
    db.commit()
    return {"message": "Patient deleted successfully"}
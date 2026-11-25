import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

export const getPatients = () => API.get("/patients");

export const getPatient = (id) => API.get(`/patients/${id}`);

export const addPatient = (patient) => API.post("/patients", patient);

export const updatePatient = (id, patient) =>
  API.put(`/patients/${id}`, patient);

export const deletePatient = (id) =>
  API.delete(`/patients/${id}`);

export const dischargePatient = (id) =>
  API.patch(`/patients/${id}/discharge`);

export default API;
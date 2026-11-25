
import { useEffect, useMemo, useState } from "react";
import {
  Activity, Users, UserCheck, UserRound, LayoutDashboard,
  ClipboardList, Search, Plus, Bell, ChevronDown, Pencil,
  Trash2, LogOut, X, CheckCircle, Menu
} from "lucide-react";

import {
  getPatients,
  addPatient,
  updatePatient,
  deletePatient as deletePatientAPI,
  dischargePatient as dischargePatientAPI
} from "./api";

import "./App.css";

const wards = ["General Ward", "ICU", "Emergency", "Private Ward"];

const departments = [
  "Cardiology", "Neurology", "Orthopedics",
  "Pediatrics", "General Medicine"
];

const doctors = [
  "Dr. Sharma", "Dr. Mehta", "Dr. Patel",
  "Dr. Verma", "Dr. Singh"
];

const emptyForm = {
  name: "",
  age: "",
  gender: "",
  ward: "",
  department: "",
  doctor: "",
  admissionDate: "",
  status: "Admitted"
};

function App() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [wardFilter, setWardFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);

  const today = new Date().toLocaleDateString("en-CA");

  async function fetchPatients() {
    try {
      setApiError("");
      const response = await getPatients();
      setPatients(response.data);
    } catch (error) {
      console.error("Error fetching patients:", error);
      setApiError(
        "Unable to load patients. Check whether the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) =>
      patient.name.toLowerCase().includes(search.toLowerCase()) &&
      (!wardFilter || patient.ward === wardFilter) &&
      (!departmentFilter || patient.department === departmentFilter) &&
      (!doctorFilter || patient.doctor === doctorFilter) &&
      (!statusFilter || patient.status === statusFilter)
    );
  }, [
    patients, search, wardFilter,
    departmentFilter, doctorFilter, statusFilter
  ]);

  const admittedCount = patients.filter(
    p => p.status === "Admitted"
  ).length;

  const dischargedCount = patients.filter(
    p => p.status === "Discharged"
  ).length;

  function openAddModal() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  }

  function openEditModal(patient) {
    setEditingId(patient.id);
    setForm({
      ...patient,
      age: String(patient.age)
    });
    setError("");
    setModalOpen(true);
  }

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!/^[A-Za-z ]+$/.test(form.name.trim())) {
      setError("Name must contain letters and spaces only.");
      return;
    }

    const age = Number(form.age);

    if (!form.age || !Number.isInteger(age) || age < 0 || age > 120) {
      setError("Age must be a whole number between 0 and 120.");
      return;
    }

    if (!form.gender || !form.ward || !form.department || !form.doctor) {
      setError("Please select all required dropdown fields.");
      return;
    }

    if (!form.admissionDate || form.admissionDate > today) {
      setError("Admission date is required and cannot be in the future.");
      return;
    }

    const patientData = {
      ...form,
      name: form.name.trim(),
      age
    };

    try {
      setSaving(true);
      setError("");

      if (editingId !== null) {
        await updatePatient(editingId, patientData);
      } else {
        await addPatient(patientData);
      }

      await fetchPatients();

      setModalOpen(false);
      setForm(emptyForm);
      setEditingId(null);
    } catch (error) {
      console.error("Error saving patient:", error);

      const detail = error.response?.data?.detail;
      setError(
        typeof detail === "string"
          ? detail
          : "Unable to save patient. Please check the entered details."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deletePatient(id) {
    if (!window.confirm("Are you sure you want to delete this patient?")) {
      return;
    }

    try {
      await deletePatientAPI(id);
      await fetchPatients();
    } catch (error) {
      console.error("Error deleting patient:", error);
      setApiError("Unable to delete patient. Please try again.");
    }
  }

  async function dischargePatient(id) {
    try {
      await dischargePatientAPI(id);
      await fetchPatients();
    } catch (error) {
      console.error("Error discharging patient:", error);
      setApiError("Unable to discharge patient. Please try again.");
    }
  }

  function clearFilters() {
    setSearch("");
    setWardFilter("");
    setDepartmentFilter("");
    setDoctorFilter("");
    setStatusFilter("");
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-icon"><Activity size={23} /></div>
          <div>
            <h2>MediCare</h2>
            <span>Hospital Management</span>
          </div>
          <button
            className="mobile-close"
            onClick={() => setMobileMenu(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="nav-label">MAIN MENU</div>
        <nav>
          <a
            className="nav-item active"
            href="#dashboard"
            onClick={() => setMobileMenu(false)}
          >
            <LayoutDashboard size={19} /> Dashboard
          </a>
          <a
            className="nav-item"
            href="#patients"
            onClick={() => setMobileMenu(false)}
          >
            <Users size={19} /> Patients
          </a>
          <a
            className="nav-item"
            href="#patients"
            onClick={() => setMobileMenu(false)}
          >
            <ClipboardList size={19} /> Admissions
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="profile-avatar">SA</div>
          <div className="profile-info">
            <strong>Hospital Admin</strong>
            <span>Administrator</span>
          </div>
          <LogOut size={18} className="logout-icon" />
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button
            className="mobile-menu"
            onClick={() => setMobileMenu(true)}
          >
            <Menu size={23} />
          </button>

          <div className="breadcrumb">
            Hospital / <strong>Dashboard</strong>
          </div>

          <div className="topbar-right">
            <button className="notification-button" aria-label="Notifications">
              <Bell size={20} />
              <span />
            </button>
            <div className="admin-avatar">SA</div>
            <span className="admin-name">Admin</span>
            <ChevronDown size={16} />
          </div>
        </header>

        <section className="page-content" id="dashboard">
          <div className="page-heading">
            <div>
              <p className="eyebrow">OVERVIEW</p>
              <h1>Hospital Dashboard</h1>
              <p className="subtitle">
                Manage your patients and admission records.
              </p>
            </div>

            <button className="primary-button" onClick={openAddModal}>
              <Plus size={19} /> Add New Patient
            </button>
          </div>

          <div className="stats-grid">
            <StatCard
              title="Total Patients"
              value={patients.length}
              icon={<Users />}
              color="blue"
            />
            <StatCard
              title="Currently Admitted"
              value={admittedCount}
              icon={<UserCheck />}
              color="green"
            />
            <StatCard
              title="Discharged Patients"
              value={dischargedCount}
              icon={<UserRound />}
              color="purple"
            />
            <StatCard
              title="Departments"
              value={departments.length}
              icon={<Activity />}
              color="orange"
            />
          </div>

          <section className="patient-section" id="patients">
            <div className="section-heading">
              <div>
                <h2>Patient Records</h2>
                <p>View and manage all registered patients.</p>
              </div>
              <span className="record-count">
                {filteredPatients.length} records
              </span>
            </div>

            {apiError && (
              <p className="form-error">{apiError}</p>
            )}

            {loading && <p>Loading patient records...</p>}

            <div className="filter-toolbar">
              <div className="search-box">
                <Search size={19} />
                <input
                  type="text"
                  placeholder="Search patient name..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              <select
                value={wardFilter}
                onChange={e => setWardFilter(e.target.value)}
              >
                <option value="">All Wards</option>
                {wards.map(w => <option key={w}>{w}</option>)}
              </select>

              <select
                value={departmentFilter}
                onChange={e => setDepartmentFilter(e.target.value)}
              >
                <option value="">All Departments</option>
                {departments.map(d => <option key={d}>{d}</option>)}
              </select>

              <select
                value={doctorFilter}
                onChange={e => setDoctorFilter(e.target.value)}
              >
                <option value="">All Doctors</option>
                {doctors.map(d => <option key={d}>{d}</option>)}
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="Admitted">Admitted</option>
                <option value="Discharged">Discharged</option>
              </select>

              <button className="clear-button" onClick={clearFilters}>
                Clear
              </button>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>PATIENT</th>
                    <th>AGE / GENDER</th>
                    <th>WARD</th>
                    <th>DEPARTMENT</th>
                    <th>DOCTOR</th>
                    <th>ADMISSION DATE</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {!loading && filteredPatients.map(patient => (
                    <tr key={patient.id}>
                      <td>
                        <div className="patient-name-cell">
                          <div className="patient-avatar">
                            {patient.name.split(" ")
                              .map(n => n[0])
                              .join("")
                              .slice(0, 2)}
                          </div>
                          <strong>{patient.name}</strong>
                        </div>
                      </td>

                      <td>{patient.age} / {patient.gender}</td>
                      <td>{patient.ward}</td>
                      <td>{patient.department}</td>
                      <td>{patient.doctor}</td>
                      <td>{patient.admissionDate}</td>

                      <td>
                        <span className={`status-badge ${patient.status.toLowerCase()}`}>
                          <span /> {patient.status}
                        </span>
                      </td>

                      <td>
                        <div className="action-buttons">
                          <button
                            title="Edit patient"
                            onClick={() => openEditModal(patient)}
                          >
                            <Pencil size={16} />
                          </button>

                          {patient.status === "Admitted" && (
                            <button
                              title="Mark discharged"
                              onClick={() => dischargePatient(patient.id)}
                            >
                              <CheckCircle size={17} />
                            </button>
                          )}

                          <button
                            title="Delete patient"
                            className="delete-action"
                            onClick={() => deletePatient(patient.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {!loading && filteredPatients.length === 0 && (
                    <tr>
                      <td colSpan="8" className="empty-state">
                        No patients found. Try changing your search or filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="table-footer">
              Showing {filteredPatients.length} of {patients.length} patients
            </div>
          </section>
        </section>
      </main>

      {modalOpen && (
        <div
          className="modal-overlay"
          onClick={() => !saving && setModalOpen(false)}
        >
          <div
            className="patient-modal"
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-heading">
              <div>
                <h2>
                  {editingId !== null ? "Edit Patient" : "Add New Patient"}
                </h2>
                <p>Enter the patient's admission details below.</p>
              </div>

              <button
                className="close-button"
                disabled={saving}
                onClick={() => setModalOpen(false)}
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <FormField label="Patient Name">
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    required
                  />
                </FormField>

                <FormField label="Age">
                  <input
                    name="age"
                    type="number"
                    min="0"
                    max="120"
                    value={form.age}
                    onChange={handleChange}
                    placeholder="Enter age"
                    required
                  />
                </FormField>

                <FormField label="Gender">
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select gender</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </FormField>

                <FormField label="Ward">
                  <select
                    name="ward"
                    value={form.ward}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select ward</option>
                    {wards.map(w => <option key={w}>{w}</option>)}
                  </select>
                </FormField>

                <FormField label="Department">
                  <select
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select department</option>
                    {departments.map(d => <option key={d}>{d}</option>)}
                  </select>
                </FormField>

                <FormField label="Doctor">
                  <select
                    name="doctor"
                    value={form.doctor}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select doctor</option>
                    {doctors.map(d => <option key={d}>{d}</option>)}
                  </select>
                </FormField>

                <FormField label="Admission Date">
                  <input
                    type="date"
                    name="admissionDate"
                    max={today}
                    value={form.admissionDate}
                    onChange={handleChange}
                    required
                  />
                </FormField>

                <FormField label="Status">
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option>Admitted</option>
                    <option>Discharged</option>
                  </select>
                </FormField>
              </div>

              {error && <p className="form-error">{error}</p>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  disabled={saving}
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId !== null
                      ? "Save Changes"
                      : "Add Patient"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>{icon}</div>
      <div>
        <p>{title}</p>
        <h2>{value}</h2>
      </div>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <label className="form-field">
      <span>{label} <b>*</b></span>
      {children}
    </label>
  );
}

export default App;

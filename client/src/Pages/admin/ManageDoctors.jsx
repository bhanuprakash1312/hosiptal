import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import api from "../../services/api";

const ManageDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department_id: ""
  });

  const fetchData = async () => {
    try {
      const [docsRes, deptsRes] = await Promise.all([
        api.get("/admin/doctors"),
        api.get("/admin/departments")
      ]);
      setDoctors(docsRes.data);
      setDepartments(deptsRes.data);
      if (deptsRes.data.length > 0 && !formData.department_id) {
        setFormData(prev => ({ ...prev, department_id: deptsRes.data[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/doctors", formData);
      setFormData({ name: "", email: "", phone: "", department_id: departments.length > 0 ? departments[0].id : "" });
      setError("");
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create doctor");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) return;
    try {
      await api.delete(`/admin/doctors/${id}`);
      fetchData();
    } catch (err) {
      alert("Failed to delete doctor");
    }
  };

  return (
    <div className="page-container">
      <Navbar />
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
          <Link to="/admin" className="btn-secondary" style={{ padding: '0.4rem 0.8rem', borderRadius: '0.5rem', fontSize: '0.9rem' }}>
            ← Back
          </Link>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
            Manage Doctors
          </h1>
        </div>

        {error && <p style={{ color: '#ef4444', backgroundColor: '#fee2e2', padding: '1rem', borderRadius: '0.5rem' }}>{error}</p>}

        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Add New Doctor</h3>
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="form-label">Full Name</label>
              <input type="text" name="name" placeholder="Dr. John Doe" className="form-input" value={formData.name} onChange={handleChange} required />
            </div>
            <div>
              <label className="form-label">Email Address</label>
              <input type="email" name="email" placeholder="doctor@hospital.com" className="form-input" value={formData.email} onChange={handleChange} required />
            </div>
            <div>
              <label className="form-label">Phone Number</label>
              <input type="text" name="phone" placeholder="1234567890" className="form-input" value={formData.phone} onChange={handleChange} required />
            </div>
            <div>
              <label className="form-label">Department</label>
              <select name="department_id" className="form-input" value={formData.department_id} onChange={handleChange} required>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
              <button type="submit" className="btn-primary btn-block">Create Doctor Profile</button>
            </div>
          </form>
        </div>

        <div className="glass-panel" style={{ padding: '0', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Name</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Email</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Phone</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Department</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doc) => (
                <tr key={doc.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                  <td style={{ padding: '1rem', fontWeight: '600', color: 'var(--text-primary)' }}>{doc.name}</td>
                  <td style={{ padding: '1rem' }}>{doc.email}</td>
                  <td style={{ padding: '1rem' }}>{doc.phone}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ backgroundColor: '#8b5cf622', color: '#8b5cf6', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: '600' }}>
                      {doc.department_name}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button 
                      onClick={() => handleDelete(doc.id)}
                      style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {doctors.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No doctors found. Add one above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageDoctors;

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import api from "../../services/api";

const ManageDepartements = () => {
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const fetchDepartments = async () => {
    try {
      const res = await api.get("/admin/departments");
      setDepartments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await api.post("/admin/departments", { name });
      setName("");
      setError("");
      fetchDepartments();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create department");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this department?")) return;
    try {
      await api.delete(`/admin/departments/${id}`);
      fetchDepartments();
    } catch (err) {
      alert("Failed to delete department");
    }
  };

  return (
    <div className="page-container">
      <Navbar />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
          <Link to="/admin" className="btn-secondary" style={{ padding: '0.4rem 0.8rem', borderRadius: '0.5rem', fontSize: '0.9rem' }}>
            ← Back
          </Link>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
            Manage Departments
          </h1>
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <form onSubmit={handleCreate} style={{ display: 'flex', gap: '1rem' }}>
            <input
              type="text"
              placeholder="New Department Name"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn-primary" style={{ padding: '0 2rem' }}>
              Add Department
            </button>
          </form>
        </div>

        <div className="glass-panel" style={{ padding: '0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>ID</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Department Name</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr key={dept.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                  <td style={{ padding: '1rem' }}>{dept.id}</td>
                  <td style={{ padding: '1rem', fontWeight: '600' }}>{dept.name}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button 
                      onClick={() => handleDelete(dept.id)}
                      style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {departments.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No departments found. Add one above.
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

export default ManageDepartements;

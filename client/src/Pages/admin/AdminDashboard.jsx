import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import { Activity, Users, Stethoscope, Building2 } from "lucide-react";
import api from "../../services/api";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    total_patients: 0,
    total_doctors: 0,
    total_departments: 0,
    daily_appointments: 0
  });

  useEffect(() => {
    api.get('/admin/stats')
      .then(res => setData(res.data))
      .catch(err => console.error("Error fetching admin stats:", err));
  }, []);

  const stats = [
    { title: "Total Patients", value: data.total_patients, icon: <Users size={24} />, color: "var(--accent-blue)" },
    { title: "Active Doctors", value: data.total_doctors, icon: <Stethoscope size={24} />, color: "#10b981" },
    { title: "Departments", value: data.total_departments, icon: <Building2 size={24} />, color: "#8b5cf6" },
    { title: "Daily Appointments", value: data.daily_appointments, icon: <Activity size={24} />, color: "#f59e0b" },
  ];

  const adminModules = [
    { name: "Manage Doctors", path: "/admin/doctors", description: "Add, remove, or edit doctor profiles and schedules." },
    { name: "Manage Departments", path: "/admin/departments", description: "Organize hospital departments and services." },
    { name: "User Management", path: "/admin/users", description: "View and manage patient accounts and records." },
  ];

  return (
    <div className="page-container">
      <Navbar />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Admin Control Panel
          </h1>
          <p className="text-subtitle">Manage hospital operations, staff, and analytics.</p>
        </header>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          {stats.map((stat, idx) => (
            <div key={idx} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '50px', height: '50px', borderRadius: '1rem',
                backgroundColor: `${stat.color}15`, color: stat.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {stat.icon}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600' }}>{stat.title}</p>
                <h3 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)' }}>{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Admin Modules Grid */}
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
          Quick Actions
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem'
        }}>
          {adminModules.map((module, idx) => (
            <div key={idx} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                {module.name}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem', flex: 1 }}>
                {module.description}
              </p>
              <button 
                className="btn-primary" 
                style={{ alignSelf: 'flex-start', padding: '0.5rem 1.5rem' }}
                onClick={() => navigate(module.path)}
              >
                Go to Module →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

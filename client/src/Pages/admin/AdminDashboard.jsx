import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import { Activity, Users, Stethoscope, Building2, Bell, ShieldAlert, CalendarClock } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import api from "../../services/api";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    total_patients: 0,
    total_doctors: 0,
    total_departments: 0,
    daily_appointments: 0
  });

  const [chartData, setChartData] = useState({
    appointmentTrends: [],
    departmentStats: []
  });

  useEffect(() => {
    // Fetch top stats
    api.get('/admin/stats')
      .then(res => setData(res.data))
      .catch(err => console.error("Error fetching admin stats:", err));

    // Fetch chart data
    api.get('/admin/chart_data')
      .then(res => setChartData(res.data))
      .catch(err => console.error("Error fetching chart data:", err));
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

  // Real data for charts, mock data for feed since it's not implemented on backend yet
  const appointmentTrends = chartData.appointmentTrends.length > 0 ? chartData.appointmentTrends : [
    { name: 'Mon', appointments: 0 },
    { name: 'Tue', appointments: 0 },
    { name: 'Wed', appointments: 0 },
    { name: 'Thu', appointments: 0 },
    { name: 'Fri', appointments: 0 },
    { name: 'Sat', appointments: 0 },
    { name: 'Sun', appointments: 0 },
  ];

  const departmentStats = chartData.departmentStats.length > 0 ? chartData.departmentStats : [
    { name: 'No Data', patients: 0 }
  ];

  const recentActivities = [
    { id: 1, action: "New Doctor Registered", details: "Dr. Sarah Jenkins (Neurology)", time: "10 mins ago", icon: <Stethoscope size={18} color="#10b981"/> },
    { id: 2, action: "Patient Emergency", details: "Room 302 requested immediate assistance", time: "1 hour ago", icon: <ShieldAlert size={18} color="#ef4444"/> },
    { id: 3, action: "System Update", details: "Server maintenance completed successfully", time: "3 hours ago", icon: <Activity size={18} color="var(--accent-blue)"/> },
    { id: 4, action: "Appointment Surge", details: "Unusual volume in General Medicine today", time: "5 hours ago", icon: <CalendarClock size={18} color="#f59e0b"/> },
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

        {/* Charts Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
              Weekly Appointment Trends
            </h3>
            <div style={{ height: 300, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={appointmentTrends} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{fontSize: 12}} />
                  <YAxis stroke="var(--text-secondary)" tick={{fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: 'var(--shadow-main)', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)' }}
                  />
                  <Line type="monotone" dataKey="appointments" stroke="var(--accent-blue)" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 8}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
              Patient Distribution by Department
            </h3>
            <div style={{ height: 300, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentStats} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{fontSize: 12}} />
                  <YAxis stroke="var(--text-secondary)" tick={{fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: 'var(--shadow-main)', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)' }}
                    cursor={{fill: 'rgba(0, 102, 255, 0.05)'}}
                  />
                  <Bar dataKey="patients" fill="url(#colorGradient)" radius={[4, 4, 0, 0]} />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00d2ff" />
                      <stop offset="100%" stopColor="#0066ff" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Bottom Grid: Modules & Feed */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
          
          {/* Quick Actions */}
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
              Quick Actions
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
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
                    style={{ alignSelf: 'flex-start', padding: '0.5rem 1.5rem', fontSize: '0.9rem' }}
                    onClick={() => navigate(module.path)}
                  >
                    Manage →
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
                System Activity
              </h2>
              <button style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', fontWeight: 600, cursor: 'pointer' }}>View All</button>
            </div>
            
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {recentActivities.map(activity => (
                <div key={activity.id} style={{ display: 'flex', gap: '1rem', borderBottom: activity.id !== 4 ? '1px solid var(--border-glass)' : 'none', paddingBottom: activity.id !== 4 ? '1.5rem' : '0' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {activity.icon}
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                      <h4 style={{ fontWeight: 700, color: 'var(--text-primary)', margin: 0, fontSize: '0.95rem' }}>{activity.action}</h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', marginLeft: '1rem' }}>{activity.time}</span>
                    </div>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.4 }}>{activity.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

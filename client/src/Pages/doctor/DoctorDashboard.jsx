import { useEffect, useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "../../components/common/LoadingScreen";
import { Users, Clock, CheckCircle, Search, Calendar, Video, Check, X, LogOut, Trash2 } from "lucide-react";
import { logout } from "../../services/authService";

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/doctor/appointments")
      .then(res => {
        setAppointments(res.data);
        setIsLoading(false);
      })
      .catch(() => {
        alert("Failed to load");
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <LoadingScreen fullScreen={true} message="Loading your schedule..." />;
  }

  const handleLogout = () => {
    logout();
    navigate("/doctor/login");
  };

  const filteredAppointments = appointments.filter(a => 
    a.visit_type.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateStatus = (id, status) => {
    api.patch(`/doctor/appointments/${id}?status=${status}`)
      .then(() => {
        setAppointments(prev =>
          prev.map(a =>
            a.id === id ? { ...a, status } : a
          )
        );
      });
  };

  return (
    <div className="page-container">
      <div className="container-xl" style={{paddingTop: '4rem', paddingBottom: '4rem'}}>
        
        {/* HEADER */}
        <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem', marginBottom: '3rem'}}>
          <div>
            <h2 className="title-hero" style={{fontSize: '2.5rem', margin: 0}}>
              Doctor Dashboard
            </h2>
            <p style={{color: 'var(--text-secondary)', marginTop: '0.5rem'}}>Manage your schedule and consultations.</p>
          </div>
          
          <button onClick={handleLogout} className="btn-secondary" style={{borderColor: '#ef4444', color: '#ef4444', display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
            <LogOut size={20} /> Logout
          </button>
        </div>

        {/* QUICK STATS */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem'}}>
          <div className="glass-panel" style={{padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem'}}>
            <div style={{background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '1rem', color: '#3b82f6'}}>
              <Users size={28} />
            </div>
            <div>
              <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600}}>Total Patients Today</p>
              <h3 style={{fontSize: '1.75rem', fontWeight: 800}}>{appointments.length}</h3>
            </div>
          </div>

          <div className="glass-panel" style={{padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem'}}>
            <div style={{background: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: '1rem', color: '#f59e0b'}}>
              <Clock size={28} />
            </div>
            <div>
              <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600}}>Pending Consults</p>
              <h3 style={{fontSize: '1.75rem', fontWeight: 800}}>{appointments.filter(a => a.status === 'BOOKED').length}</h3>
            </div>
          </div>

          <div className="glass-panel" style={{padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem'}}>
            <div style={{background: 'rgba(34, 197, 94, 0.1)', padding: '1rem', borderRadius: '1rem', color: '#22c55e'}}>
              <CheckCircle size={28} />
            </div>
            <div>
              <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600}}>Completed</p>
              <h3 style={{fontSize: '1.75rem', fontWeight: 800}}>{appointments.filter(a => a.status === 'COMPLETED').length}</h3>
            </div>
          </div>
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className="glass-panel" style={{padding: '1rem 1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem'}}>
          <Search size={20} color="var(--text-secondary)" />
          <input 
            type="text" 
            placeholder="Search by visit type or status..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{flex: 1, border: 'none', background: 'transparent', fontSize: '1rem', color: 'var(--text-primary)', outline: 'none'}}
          />
        </div>

        <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem'}}>
          <Calendar className="text-gradient" size={24} />
          <h3 style={{fontSize: '1.5rem', fontWeight: 700, margin: 0}}>Upcoming Appointments</h3>
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="glass-panel" style={{padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)'}}>
            No appointments found matching your criteria.
          </div>
        ) : (
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem'}}>
            {filteredAppointments.map(appt => (
              <div
                key={appt.id}
                className="glass-panel"
                style={{padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem'}}
              >
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <h3 style={{fontWeight: '700', fontSize: '1.25rem', color: 'var(--text-primary)'}}>
                    <span style={{color: 'var(--accent-blue)'}}>{appt.appointment_date}</span> • {appt.time_slot}
                  </h3>
                  <span
                    style={{
                      padding: '0.4rem 1rem',
                      borderRadius: '2rem',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      backgroundColor: appt.status === "BOOKED" ? '#dcfce7' : (appt.status === "COMPLETED" ? '#f0fdf4' : '#fee2e2'),
                      color: appt.status === "BOOKED" ? '#166534' : (appt.status === "COMPLETED" ? '#15803d' : '#991b1b')
                    }}
                  >
                    {appt.status}
                  </span>
                </div>

                <p style={{color: 'var(--text-secondary)', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  <span style={{fontWeight: '600'}}>Visit Type:</span> {appt.visit_type}
                </p>

                {appt.status === "BOOKED" && (
                  <div style={{display: 'flex', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-glass)', marginTop: 'auto'}}>
                    <button
                      onClick={() => navigate(`/chat/${appt.id}`)}
                      className="btn-primary"
                      style={{padding: '0.6rem 1rem', fontSize: '0.9rem', flex: 1, display: 'flex', justifyContent: 'center', gap: '0.5rem'}}
                    >
                      <Video size={18} /> Join
                    </button>

                    <button
                      onClick={() => updateStatus(appt.id, "COMPLETED")}
                      className="btn-secondary"
                      style={{padding: '0.6rem 1rem', fontSize: '0.9rem', flex: 1, borderColor: '#4ade80', color: '#16a34a', display: 'flex', justifyContent: 'center', gap: '0.5rem'}}
                    >
                      <Check size={18} /> Done
                    </button>

                    <button
                      onClick={() => updateStatus(appt.id, "CANCELLED")}
                      className="btn-secondary"
                      style={{padding: '0.6rem 1rem', fontSize: '0.9rem', flex: 1, borderColor: '#fca5a5', color: '#ef4444', display: 'flex', justifyContent: 'center', gap: '0.5rem'}}
                    >
                      <X size={18} /> Drop
                    </button>
                  </div>
                )}

                {(appt.status === "CANCELLED" || appt.status === "COMPLETED") && (
                  <div style={{display: 'flex', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-glass)', marginTop: 'auto'}}>
                    <button
                      onClick={() => {
                        api.delete(`/doctor/appointments/${appt.id}`)
                          .then(() => setAppointments(appointments.filter(a => a.id !== appt.id)))
                          .catch(() => alert("Failed to remove appointment"));
                      }}
                      className="btn-secondary"
                      style={{padding: '0.6rem 1rem', fontSize: '0.9rem', flex: 1, borderColor: 'var(--border-glass)', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'center', gap: '0.5rem'}}
                    >
                      <Trash2 size={18} /> Remove
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;

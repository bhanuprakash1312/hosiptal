import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { logout } from "../../services/authService";
import LoadingScreen from "../../components/common/LoadingScreen";
import { Activity, Heart, Thermometer, Calendar, FileText, Pill, LogOut, Plus, Trash2 } from "lucide-react";

const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/appointments/patient/me")
      .then((res) => {
        setAppointments(res.data);
        setIsLoading(false);
      })
      .catch(() => {
        alert("Failed to load appointments");
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <LoadingScreen fullScreen={true} message="Loading your dashboard..." />;
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="page-container">
      <div className="container-xl" style={{paddingTop: '4rem', paddingBottom: '4rem'}}>

        {/* HEADER */}
        <div className="dashboard-header">
          <div>
            <h1 className="title-hero" style={{fontSize: '2.5rem', margin: 0}}>
              Patient Dashboard
            </h1>
            <p style={{color: 'var(--text-secondary)', marginTop: '0.5rem'}}>Welcome back! Here is your health overview.</p>
          </div>

          <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
            <button onClick={() => navigate("/book-appointment")} className="btn-primary" style={{gap: '0.5rem'}}>
              <Plus size={20} /> Book Appointment
            </button>

            <button onClick={handleLogout} className="btn-secondary" style={{borderColor: '#ef4444', color: '#ef4444', display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
              <LogOut size={20} /> Logout
            </button>
          </div>
        </div>

        {/* HEALTH VITALS WIDGETS */}
        <div className="stats-grid">
          <div className="glass-panel" style={{padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem'}}>
            <div style={{background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '1rem', color: '#ef4444'}}>
              <Heart size={28} />
            </div>
            <div>
              <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600}}>Heart Rate</p>
              <h3 style={{fontSize: '1.5rem', fontWeight: 800}}>72 <span style={{fontSize: '1rem', fontWeight: 500, color: 'var(--text-secondary)'}}>bpm</span></h3>
            </div>
          </div>

          <div className="glass-panel" style={{padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem'}}>
            <div style={{background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '1rem', color: '#3b82f6'}}>
              <Activity size={28} />
            </div>
            <div>
              <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600}}>Blood Pressure</p>
              <h3 style={{fontSize: '1.5rem', fontWeight: 800}}>120/80 <span style={{fontSize: '1rem', fontWeight: 500, color: 'var(--text-secondary)'}}>mmHg</span></h3>
            </div>
          </div>

          <div className="glass-panel" style={{padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem'}}>
            <div style={{background: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: '1rem', color: '#f59e0b'}}>
              <Thermometer size={28} />
            </div>
            <div>
              <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600}}>Temperature</p>
              <h3 style={{fontSize: '1.5rem', fontWeight: 800}}>98.6 <span style={{fontSize: '1rem', fontWeight: 500, color: 'var(--text-secondary)'}}>°F</span></h3>
            </div>
          </div>
        </div>

        {/* CONTENT GRID */}
        <div className="content-layout">
          
          {/* LEFT: APPOINTMENTS */}
          <div>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem'}}>
              <Calendar className="text-gradient" size={28} />
              <h2 className="section-title" style={{fontSize: '1.75rem', textAlign: 'left', margin: 0}}>
                My Appointments
              </h2>
            </div>

            {appointments.length === 0 ? (
              <div className="glass-panel" style={{padding: '4rem 2rem', textAlign: 'center'}}>
                <p className="text-subtitle" style={{margin: '0 auto 2rem auto', fontSize: '1.25rem'}}>
                  You have no upcoming appointments
                </p>
                <button onClick={() => navigate("/book-appointment")} className="btn-primary">
                  Book Your First Appointment
                </button>
              </div>
            ) : (
              <div className="appointment-list">
                {appointments.map((appt) => (
                  <div key={appt.id} className="glass-panel appointment-item">
                    <div>
                      <p style={{fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.25rem'}}>
                        {appt.visit_type} Consultation
                      </p>
                      <p style={{color: 'var(--text-secondary)', fontSize: '0.95rem'}}>
                        <span style={{fontWeight: '600'}}>{appt.appointment_date}</span> at {appt.time_slot}
                      </p>
                    </div>

                    <div style={{display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap'}}>
                      <span style={{
                        padding: '0.4rem 1rem',
                        borderRadius: '2rem',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        backgroundColor: appt.status === "BOOKED" ? '#dcfce7' : '#fee2e2',
                        color: appt.status === "BOOKED" ? '#166534' : '#991b1b'
                      }}>
                        {appt.status}
                      </span>
                      
                      {appt.status === "BOOKED" && (
                        <div className="appointment-actions">
                          <button onClick={() => navigate(`/chat/${appt.id}`)} className="btn-primary" style={{padding: '0.5rem 1rem', fontSize: '0.9rem'}}>
                            Chat
                          </button>
                          <button 
                            onClick={() => {
                              api.patch(`/appointments/cancel/${appt.id}`)
                                .then(() => setAppointments(appointments.map(a => a.id === appt.id ? {...a, status: 'CANCELLED'} : a)))
                                .catch(() => alert("Failed to cancel"));
                            }} 
                            className="btn-secondary" 
                            style={{padding: '0.5rem 1rem', fontSize: '0.9rem', borderColor: '#fca5a5', color: '#ef4444'}}
                          >
                            Cancel
                          </button>
                        </div>
                      )}

                      {(appt.status === "CANCELLED" || appt.status === "COMPLETED") && (
                        <div className="appointment-actions">
                          <button 
                            onClick={() => {
                              api.delete(`/appointments/${appt.id}`)
                                .then(() => setAppointments(appointments.filter(a => a.id !== appt.id)))
                                .catch(() => alert("Failed to remove"));
                            }} 
                            className="btn-secondary" 
                            style={{padding: '0.5rem 1rem', fontSize: '0.9rem', display: 'flex', gap: '0.5rem', alignItems: 'center', borderColor: 'var(--border-glass)', color: 'var(--text-secondary)'}}
                          >
                            <Trash2 size={16} /> Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: QUICK LINKS */}
          <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
            <div className="glass-panel" style={{padding: '1.5rem'}}>
              <h3 style={{fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem'}}>
                Quick Actions
              </h3>
              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                <button className="btn-secondary" style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '1rem', width: '100%', padding: '1rem', border: 'none', background: 'rgba(255,255,255,0.5)'}}>
                  <FileText size={20} color="var(--accent-blue)" />
                  <span style={{fontWeight: 600, color: 'var(--text-primary)'}}>Medical Records</span>
                </button>
                <button className="btn-secondary" style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '1rem', width: '100%', padding: '1rem', border: 'none', background: 'rgba(255,255,255,0.5)'}}>
                  <Pill size={20} color="var(--accent-blue)" />
                  <span style={{fontWeight: 600, color: 'var(--text-primary)'}}>Prescriptions</span>
                </button>
                <button className="btn-secondary" style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '1rem', width: '100%', padding: '1rem', border: 'none', background: 'rgba(255,255,255,0.5)'}}>
                  <Activity size={20} color="var(--accent-blue)" />
                  <span style={{fontWeight: 600, color: 'var(--text-primary)'}}>Lab Results</span>
                </button>
              </div>
            </div>

            <div className="glass-panel" style={{padding: '1.5rem', background: 'linear-gradient(135deg, rgba(0, 102, 255, 0.05) 0%, rgba(0, 210, 255, 0.05) 100%)'}}>
              <h3 style={{fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--accent-blue)'}}>Need Help?</h3>
              <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: 1.5}}>
                Reach out to our support team for any queries related to your portal or appointments.
              </p>
              <button className="btn-primary" style={{width: '100%', padding: '0.75rem', fontSize: '0.9rem'}}>
                Contact Support
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;

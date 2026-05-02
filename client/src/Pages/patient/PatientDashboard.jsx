import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { logout } from "../../services/authService";

const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/appointments/patient/me")
      .then((res) => setAppointments(res.data))
      .catch(() => alert("Failed to load appointments"));
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="page-container">
      <div className="container-xl" style={{paddingTop: '4rem', paddingBottom: '4rem'}}>

        {/* HEADER */}
        <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem', marginBottom: '3rem'}}>
          <h1 className="title-hero" style={{fontSize: '2.5rem', margin: 0}}>
            Patient Dashboard
          </h1>

          <div style={{display: 'flex', gap: '1rem'}}>
            <button onClick={() => navigate("/book-appointment")} className="btn-primary">
              + Book Appointment
            </button>

            <button onClick={handleLogout} className="btn-secondary" style={{borderColor: '#ef4444', color: '#ef4444'}}>
              Logout
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div>
          <h2 className="section-title" style={{fontSize: '1.75rem', textAlign: 'left', marginBottom: '2rem'}}>
            My Appointments
          </h2>

          {appointments.length === 0 && (
            <div className="glass-panel" style={{padding: '4rem 2rem', textAlign: 'center'}}>
              <p className="text-subtitle" style={{margin: '0 auto 2rem auto', fontSize: '1.25rem'}}>
                You have no appointments yet
              </p>
              <button
                onClick={() => navigate("/book-appointment")}
                className="btn-primary"
              >
                Book Your First Appointment
              </button>
            </div>
          )}

          {/* APPOINTMENT CARDS */}
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem'}}>
            {appointments.map((appt) => (
              <div key={appt.id} className="glass-panel" style={{padding: '2rem', display: 'flex', flexDirection: 'column'}}>
                
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem'}}>
                  <div>
                    <p style={{fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.25rem'}}>
                      {appt.visit_type}
                    </p>
                    <p style={{color: 'var(--text-secondary)', fontSize: '0.95rem'}}>
                      <span style={{fontWeight: '600'}}>{appt.appointment_date}</span> • {appt.time_slot}
                    </p>
                  </div>

                  <span
                    style={{
                      padding: '0.4rem 1rem',
                      borderRadius: '2rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      backgroundColor: appt.status === "BOOKED" ? '#dcfce7' : '#fee2e2',
                      color: appt.status === "BOOKED" ? '#166534' : '#991b1b'
                    }}
                  >
                    {appt.status}
                  </span>
                </div>

                {appt.status === "BOOKED" && (
                  <div style={{marginTop: 'auto', display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--border-glass)'}}>
                             <button
                  onClick={() => navigate(`/chat/${appt.id}`)}
                  className="btn-primary"
                  style={{padding: '0.6rem 1.25rem', fontSize: '1rem',flex:0.45}}
                >
                  Chat
                </button>
                    <button
                      onClick={() =>
                        api.patch(`/appointments/cancel/${appt.id}`)
                      }
                      className="btn-secondary"
                      style={{padding: '0.6rem 1.25rem', fontSize: '1rem', borderColor: '#fca5a5', color: '#ef4444', backgroundColor: 'transparent'}}
                    >
                      Cancel
                    </button>
           
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;

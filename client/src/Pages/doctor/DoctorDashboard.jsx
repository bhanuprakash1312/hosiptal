import { useEffect, useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/doctor/appointments")
      .then(res => setAppointments(res.data))
      .catch(() => alert("Failed to load"));
  }, []);

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
        <h2 className="title-hero" style={{fontSize: '2.5rem', marginBottom: '3rem'}}>
          Doctor Dashboard
        </h2>

        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem'}}>
          {appointments.map(appt => (
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
                    fontSize: '0.875rem',
                    fontWeight: '700',
                    backgroundColor: appt.status === "BOOKED" ? '#dcfce7' : 'var(--border-glass)',
                    color: appt.status === "BOOKED" ? '#166534' : 'var(--text-secondary)'
                  }}
                >
                  {appt.status}
                </span>
              </div>

              <p style={{color: 'var(--text-secondary)', fontSize: '1.05rem'}}>
                <span style={{fontWeight: '600'}}>Visit Type:</span> {appt.visit_type}
              </p>

              <div style={{display: 'flex', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-glass)', marginTop: 'auto'}}>
                <button
                  onClick={() => navigate(`/chat/${appt.id}`)}
                  className="btn-primary"
                  style={{padding: '0.6rem 1rem', fontSize: '0.9rem', flex: 1}}
                >
                  Chat
                </button>

                <button
                  onClick={() => updateStatus(appt.id, "COMPLETED")}
                  className="btn-secondary"
                  style={{padding: '0.6rem 1rem', fontSize: '0.9rem', flex: 1, borderColor: '#4ade80', color: '#16a34a'}}
                >
                  Complete
                </button>

                <button
                  onClick={() => updateStatus(appt.id, "CANCELLED")}
                  className="btn-secondary"
                  style={{padding: '0.6rem 1rem', fontSize: '0.9rem', flex: 1, borderColor: '#f87171', color: '#dc2626'}}
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;

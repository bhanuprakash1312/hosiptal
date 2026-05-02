import Navbar from "../../components/common/Navbar";
import { Link } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useState } from "react";
import LoadingScreen from "../../components/common/LoadingScreen";


const ReviewAppointment = () => {
  const {state} = useLocation();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  const confirmAppointment = async () => {
    setIsLoading(true);
    try {
      await api.post("/appointments", state);
      navigate("/appointment-success");
    } catch (err) {
      setIsLoading(false);
      alert(err.response?.data?.detail || "Booking failed");
    }
  };

  if (isLoading) return <LoadingScreen />;
  return (
    <div className="page-container">
      <Navbar />

      <section className="container-xl" style={{paddingTop: '8rem', paddingBottom: '4rem', display: 'flex', justifyContent: 'center'}}>
        <div className="glass-panel" style={{width: '100%', maxWidth: '800px', padding: '3rem'}}>

          <h2 className="section-title" style={{fontSize: '2.25rem', marginBottom: '2.5rem'}}>
            Review Appointment
          </h2>

          {/* DETAILS */}
          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            {[
              ["Visit Type", "New Consultation"],
              ["Department", "Cardiology"],
              ["Doctor", "Dr. Anil Kumar"],
              ["Appointment Date", "25 Aug 2026"],
              ["Time Slot", "10:00 AM – 10:30 AM"],
              ["Consultation Fee", "₹500"],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid var(--border-glass)'}}
              >
                <span style={{color: 'var(--text-secondary)'}}>{label}</span>
                <span style={{fontWeight: '600', color: 'var(--text-primary)'}}>
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* ACTIONS */}
          <div style={{marginTop: '3rem', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            <button
              className="btn-primary btn-block"
              style={{padding: '1.25rem', fontSize: '1.125rem'}}
              onClick={confirmAppointment}
            >
              Confirm Appointment
            </button>
            <Link
              to="/book-appointment"
              className="btn-secondary btn-block"
              style={{textAlign: 'center', padding: '1.25rem', fontSize: '1.125rem'}}
            >
              Edit Appointment
            </Link>
          </div>

        </div>
      </section>
    </div>
  );
};

export default ReviewAppointment;

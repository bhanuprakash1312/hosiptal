import Navbar from "../../components/common/Navbar";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../services/api";

const BookAppointment = () => {
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);

  const [appointment, setAppointment] = useState({
    doctor_id: null,
    appointment_date: "",
    time_slot: "",
    visit_type: "",
  });

  /* ---------------- FETCH DEPARTMENTS ---------------- */
  useEffect(() => {
    api.get("/master/departments")
      .then(res => setDepartments(res.data))
      .catch(() => alert("Failed to load departments"));
  }, []);

  /* ---------------- FETCH DOCTORS ---------------- */
  useEffect(() => {
    if (!selectedDept) return;

    api.get(`/master/doctors/${selectedDept}`)
      .then(res => setDoctors(res.data))
      .catch(() => alert("Failed to load doctors"));
  }, [selectedDept]);

  /* ---------------- FETCH AVAILABLE SLOTS ---------------- */
  useEffect(() => {
    if (appointment.doctor_id && appointment.appointment_date) {
      api.get(`/appointments/available-slots?doctor_id=${appointment.doctor_id}&appointment_date=${appointment.appointment_date}`)
        .then(res => {
          setAvailableSlots(res.data);
          // If the currently selected slot is no longer available, clear it
          if (!res.data.includes(appointment.time_slot)) {
            setAppointment(a => ({ ...a, time_slot: "" }));
          }
        })
        .catch(() => alert("Failed to fetch available slots"));
    } else {
      setAvailableSlots([]);
    }
  }, [appointment.doctor_id, appointment.appointment_date]);

  /* ---------------- REVIEW ---------------- */
  const handleReview = () => {
    const { doctor_id, appointment_date, time_slot, visit_type } = appointment;

    if (!doctor_id || !appointment_date || !time_slot || !visit_type) {
      alert("Please complete all required fields");
      return;
    }

    navigate("/review-appointment", { state: appointment });
  };

  return (
    <div className="page-container">
      <Navbar />

      <section className="container-xl" style={{paddingTop: '8rem', paddingBottom: '4rem'}}>
        <div className="glass-panel" style={{padding: '3rem', maxWidth: '1000px', margin: '0 auto'}}>

          <h2 className="section-title" style={{fontSize: '2.5rem', marginBottom: '2.5rem'}}>
            Book Appointment
          </h2>

          {/* VISIT TYPE */}
          <div style={{marginBottom: '2.5rem'}}>
            <h3 className="text-subtitle" style={{fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)'}}>Visit Type</h3>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem'}}>
              {["New Consultation", "Follow-up", "General Checkup"].map(type => (
                <button
                  key={type}
                  onClick={() =>
                    setAppointment(a => ({ ...a, visit_type: type }))
                  }
                  className="btn-secondary"
                  style={{
                    backgroundColor: appointment.visit_type === type ? 'var(--accent-blue)' : 'var(--white-glass)',
                    color: appointment.visit_type === type ? '#fff' : 'var(--text-primary)',
                    borderColor: appointment.visit_type === type ? 'var(--accent-blue)' : 'var(--border-glass)'
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* DEPARTMENT */}
          <div style={{marginBottom: '2.5rem'}}>
            <h3 className="text-subtitle" style={{fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)'}}>Department</h3>
            <select
              className="form-input"
              value={selectedDept}
              onChange={e => {
                setSelectedDept(e.target.value);
                setDoctors([]);
                setAppointment(a => ({ ...a, doctor_id: null }));
              }}
            >
              <option value="">Select Department</option>
              {departments.map(dep => (
                <option key={dep.id} value={dep.id}>
                  {dep.name}
                </option>
              ))}
            </select>
          </div>

          {/* DOCTORS */}
          {selectedDept && (
            <div style={{marginBottom: '2.5rem'}}>
              <h3 className="text-subtitle" style={{fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)'}}>Doctor</h3>

              {doctors.length === 0 ? (
                <p style={{color: 'var(--text-secondary)'}}>No doctors available</p>
              ) : (
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem'}}>
                  {doctors.map(doc => (
                    <div
                      key={doc.id}
                      onClick={() =>
                        setAppointment(a => ({ ...a, doctor_id: doc.id }))
                      }
                      className="glass-panel"
                      style={{
                        padding: '1.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        border: appointment.doctor_id === doc.id ? '2px solid var(--accent-blue)' : '1px solid var(--border-glass)',
                        backgroundColor: appointment.doctor_id === doc.id ? 'rgba(0, 102, 255, 0.05)' : 'var(--bg-secondary)'
                      }}
                    >
                      <h4 style={{fontSize: '1.125rem', fontWeight: '700', marginBottom: '0.25rem'}}>{doc.name}</h4>
                      <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.75rem'}}>
                        {doc.experience_years} yrs experience
                      </p>
                      <p style={{color: 'var(--accent-blue)', fontWeight: '700', fontSize: '1.125rem'}}>
                        ₹{doc.consultation_fee}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* DATE */}
          <div style={{marginBottom: '2.5rem'}}>
            <h3 className="text-subtitle" style={{fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)'}}>Select Date</h3>
            <div style={{maxWidth: '300px'}}>
              <input
                type="date"
                className="form-input"
                onChange={e =>
                  setAppointment(a => ({ ...a, appointment_date: e.target.value }))
                }
              />
            </div>
          </div>

          {/* TIME SLOT */}
          <div style={{marginBottom: '2.5rem'}}>
            <h3 className="text-subtitle" style={{fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)'}}>Available Time Slots</h3>
            
            {!appointment.doctor_id || !appointment.appointment_date ? (
              <p style={{color: 'var(--text-secondary)'}}>Please select a doctor and date first.</p>
            ) : availableSlots.length === 0 ? (
              <p style={{color: '#ef4444', fontWeight: 600}}>No slots available for this date. The doctor might be unavailable or fully booked.</p>
            ) : (
              <div style={{display: 'flex', flexWrap: 'wrap', gap: '1rem'}}>
                {availableSlots.map(slot => (
                  <button
                    key={slot}
                    onClick={() =>
                      setAppointment(a => ({ ...a, time_slot: slot }))
                    }
                    className="btn-secondary"
                    style={{
                      padding: '0.8rem 1.25rem',
                      backgroundColor: appointment.time_slot === slot ? 'var(--text-primary)' : 'var(--white-glass)',
                      color: appointment.time_slot === slot ? '#fff' : 'var(--text-primary)',
                    }}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* CONFIRM */}
          <button
            onClick={handleReview}
            className="btn-primary btn-block"
            style={{padding: '1.25rem', fontSize: '1.25rem'}}
          >
            Review & Confirm Appointment
          </button>

        </div>
      </section>
    </div>
  );
};

export default BookAppointment;

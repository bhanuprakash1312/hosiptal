import { useEffect, useState } from "react";
import api from "../../services/api";
import { Calendar as CalendarIcon, Clock, Trash2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DoctorSchedule = () => {
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const navigate = useNavigate();

  const allSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM",
    "10:30 AM", "11:00 AM", "04:00 PM",
  ];

  useEffect(() => {
    fetchBlockedSlots();
  }, []);

  const fetchBlockedSlots = () => {
    api.get("/doctor/blocked-slots")
      .then(res => setBlockedSlots(res.data))
      .catch(() => alert("Failed to load schedule"));
  };

  const handleBlockSlot = () => {
    if (!date) return alert("Please select a date");
    api.post("/doctor/blocked-slots", { date, time_slot: timeSlot || null })
      .then(() => {
        fetchBlockedSlots();
        setDate("");
        setTimeSlot("");
      })
      .catch(err => alert(err.response?.data?.detail || "Failed to block slot"));
  };

  const handleUnblock = (id) => {
    api.delete(`/doctor/blocked-slots/${id}`)
      .then(() => fetchBlockedSlots())
      .catch(() => alert("Failed to unblock slot"));
  };

  return (
    <div className="page-container">
      <div className="container-xl" style={{paddingTop: '4rem', paddingBottom: '4rem'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem'}}>
          <button onClick={() => navigate(-1)} style={{background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-blue)', fontWeight: 600}}>
            <ArrowLeft size={20} /> Back to Dashboard
          </button>
          <h2 className="title-hero" style={{fontSize: '2.5rem', margin: 0}}>
            Schedule Management
          </h2>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem'}}>
          {/* Block Slot Form */}
          <div className="glass-panel" style={{padding: '2rem'}}>
            <h3 style={{fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-primary)'}}>Block Unavailable Times</h3>
            <p style={{color: 'var(--text-secondary)', marginBottom: '2rem'}}>Select a date and optionally a specific time slot to block. If no time slot is selected, the entire day will be blocked.</p>
            
            <div style={{marginBottom: '1.5rem'}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600}}>Select Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="form-input" />
            </div>

            <div style={{marginBottom: '2rem'}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600}}>Select Time Slot (Optional)</label>
              <select value={timeSlot} onChange={e => setTimeSlot(e.target.value)} className="form-input">
                <option value="">Whole Day</option>
                {allSlots.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <button onClick={handleBlockSlot} className="btn-primary btn-block">Block Time</button>
          </div>

          {/* List of Blocked Slots */}
          <div className="glass-panel" style={{padding: '2rem'}}>
            <h3 style={{fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-primary)'}}>Currently Blocked Times</h3>
            
            {blockedSlots.length === 0 ? (
              <p style={{color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 0'}}>No blocked times currently.</p>
            ) : (
              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto'}}>
                {blockedSlots.map(slot => (
                  <div key={slot.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.5)', borderRadius: '1rem', border: '1px solid var(--border-glass)'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                      <div style={{background: '#fee2e2', padding: '0.5rem', borderRadius: '0.5rem', color: '#ef4444'}}>
                        {slot.time_slot ? <Clock size={20} /> : <CalendarIcon size={20} />}
                      </div>
                      <div>
                        <p style={{fontWeight: 600, color: 'var(--text-primary)', margin: 0}}>{slot.date}</p>
                        <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0}}>{slot.time_slot || "Whole Day Blocked"}</p>
                      </div>
                    </div>
                    <button onClick={() => handleUnblock(slot.id)} style={{background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem'}}>
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorSchedule;

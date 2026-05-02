import { useNavigate } from "react-router-dom";

const AppointmentSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="page-container" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh'}}>
      <div className="glass-panel" style={{padding: '3rem', textAlign: 'center', maxWidth: '500px', width: '100%'}}>
        
        <h2 className="title-hero" style={{fontSize: '2rem', color: '#16a34a', marginBottom: '1rem'}}>
          Appointment Confirmed ✅
        </h2>

        <p className="text-subtitle" style={{margin: '0 auto 2.5rem', fontWeight: '500'}}>
          Your appointment has been booked successfully.
        </p>

        {/* Back to Dashboard */}
        <button
          onClick={() => navigate("/dashboard")}
          className="btn-primary btn-block"
        >
          Back to Dashboard
        </button>

      </div>
    </div>
  );
};

export default AppointmentSuccess;

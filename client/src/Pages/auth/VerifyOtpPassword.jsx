import { useRef, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Navbar from "../../components/common/Navbar";

const VerifyOtpPassword = () => {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const inputsRef = useRef([]);
  const { state } = useLocation(); // { email }
  const navigate = useNavigate();

  if (!state?.email) {
    navigate("/forgot-password");
    return null;
  }

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleVerify = () => {
    const finalOtp = otp.join("");

    if (finalOtp.length !== 6) {
      alert("Enter valid 6-digit OTP");
      return;
    }

    navigate("/reset-password", {
      state: { email: state.email, otp: finalOtp },
    });
  };

  return (
    <div className="page-container">
      <Navbar />

      <section className="auth-section">
        <div className="auth-card glass-panel" style={{textAlign: 'center'}}>

          <div className="auth-header" style={{marginBottom: '2rem'}}>
            <h2 className="auth-title">Verify OTP</h2>
            <p className="text-subtitle" style={{margin: '0 auto', fontSize: '1rem'}}>
              Sent to <span style={{fontWeight: '600', color: 'var(--accent-blue)'}}>{state.email}</span>
            </p>
          </div>

          <div style={{display: 'flex', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '2rem'}}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputsRef.current[index] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="form-input"
                style={{
                  width: '3.5rem', 
                  height: '4rem', 
                  padding: '0', 
                  textAlign: 'center', 
                  fontSize: '1.5rem', 
                  fontWeight: '700'
                }}
              />
            ))}
          </div>

          <button onClick={handleVerify} className="btn-primary btn-block">
            Continue
          </button>

          <p style={{marginTop: '2rem', color: 'var(--text-secondary)', fontSize: '0.9rem'}}>
            Didn’t receive OTP?{" "}
            <Link to="/forgot-password" size="small" className="auth-link" style={{cursor: 'pointer'}}>
              Resend
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
};

export default VerifyOtpPassword;

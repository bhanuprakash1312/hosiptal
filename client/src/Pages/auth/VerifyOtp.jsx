import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../services/api";
import Navbar from "../../components/common/Navbar";

const VerifyOtp = () => {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const inputsRef = useRef([]);
  const { state } = useLocation(); // { email }
  const navigate = useNavigate();

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

  const verifyOtp = async () => {
    const finalOtp = otp.join("");

    if (finalOtp.length !== 6) {
      alert("Enter valid 6-digit OTP");
      return;
    }

    await api.post("/auth/verify-otp", {
      email: state.email,
      otp: finalOtp,
    });

    navigate("/complete-registration", {
      state: { email: state.email },
    });
  };

  return (
    <div className="page-container">
      <Navbar />

      <section className="auth-section">
        <div className="auth-card glass-panel" style={{textAlign: 'center'}}>

          {/* Heading */}
          <div className="auth-header" style={{marginBottom: '2rem'}}>
            <h2 className="auth-title">Verify OTP</h2>
            <p className="text-subtitle" style={{margin: '0 auto', fontSize: '1rem'}}>
              Sent to <span style={{fontWeight: '600', color: 'var(--accent-blue)'}}>{state.email}</span>
            </p>
          </div>

          {/* OTP Boxes */}
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

          {/* Verify Button */}
          <button onClick={verifyOtp} className="btn-primary btn-block">
            Verify OTP
          </button>

          {/* Resend */}
          <p style={{marginTop: '2rem', color: 'var(--text-secondary)', fontSize: '0.9rem'}}>
            Didn’t receive OTP?{" "}
            <span className="auth-link" style={{cursor: 'pointer'}}>
              Resend
            </span>
          </p>
        </div>
      </section>
    </div>
  );
};

export default VerifyOtp;

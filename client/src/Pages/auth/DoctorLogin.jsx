import Navbar from "../../components/common/Navbar";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, logout } from "../../services/authService";
import LoadingScreen from "../../components/common/LoadingScreen";

const DoctorLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      const res = await login(email, password);
      
      if (res.role === "DOCTOR") {
        navigate("/doctor");
      } else {
        // Not a doctor, clear token and show error
        logout();
        setError("Unauthorized access. This portal is for healthcare providers only. Redirecting to patient portal...");
        setTimeout(() => {
          setIsLoading(false);
          navigate("/login");
        }, 3000);
      }
    } catch (err) {
      setIsLoading(false);
      setError(err.response?.data?.detail || "Login failed");
    }
  };

  const handleForgot = (e) => {
    e.preventDefault();
    alert("Please contact the hospital IT administrator to reset your provider password.");
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="page-container" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />

      <section className="auth-section">
        <div className="auth-card glass-panel" style={{ borderTop: '4px solid var(--accent-blue)' }}>
          <div className="auth-header">
            <h2 className="auth-title">Provider Portal</h2>
            <p className="text-subtitle" style={{ margin: '0 auto', fontSize: '1rem' }}>
              Authorized Healthcare Staff Only
            </p>
          </div>

          {error && (
            <div style={{
              padding: '1rem', 
              marginBottom: '1.5rem', 
              backgroundColor: '#fee2e2', 
              color: '#dc2626',
              borderRadius: '0.75rem',
              fontSize: '0.9rem',
              textAlign: 'center',
              fontWeight: '500'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Provider Email</label>
              <input
                type="email"
                placeholder="doctor@hospital.com"
                className="form-input"
                onChange={(e) => { setEmail(e.target.value) }}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="form-input"
                onChange={(e) => { setPassword(e.target.value) }}
                required
              />
            </div>

            <div className="form-options" style={{ justifyContent: 'flex-end' }}>
              <a href="#" className="auth-link" onClick={handleForgot}>
                Forgot password?
              </a>
            </div>

            <button type="submit" className="btn-primary btn-block" style={{ background: '#1a2b3c' }}>
              Provider Login
            </button>
          </form>

          <div className="divider">Notice</div>

          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Are you a patient?{" "}
            <a href="/login" className="auth-link" onClick={(e) => {
              e.preventDefault();
              navigate("/login");
            }}>
              Go to Patient Portal
            </a>
          </p>
        </div>
      </section>
    </div>
  );
};

export default DoctorLogin;

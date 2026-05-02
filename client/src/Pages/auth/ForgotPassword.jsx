import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import Navbar from "../../components/common/Navbar";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post(`/auth/reset-password-request`, { email });
      navigate("/forgot-password-otp", { state: { email } });
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <Navbar />
      <section className="auth-section">
        <div className="auth-card glass-panel">
          <div className="auth-header">
            <h2 className="auth-title">Forgot Password</h2>
            <p className="text-subtitle" style={{ margin: "0 auto", fontSize: "1rem" }}>
              Enter your email to receive a password reset OTP
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
              <label className="form-label">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary btn-block" disabled={loading}>
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>

          <p style={{ marginTop: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>
            Remembered your password?{" "}
            <Link to="/login" className="auth-link">
              Back to Login
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
};

export default ForgotPassword;

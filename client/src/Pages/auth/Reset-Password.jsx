import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../../services/api";
import Navbar from "../../components/common/Navbar";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { state } = useLocation(); // { email, otp }
  const navigate = useNavigate();

  if (!state?.email || !state?.otp) {
    navigate("/forgot-password");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setSuccess("");
      return;
    }

    setError("");
    setLoading(true);
    
    try {
      await api.post(`/auth/reset-password`, {
        email: state.email,
        otp: state.otp,
        new_password: password
      });
      setSuccess("Password reset successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.detail || "Password reset failed");
      setSuccess("");
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
            <h2 className="auth-title" style={{fontSize: '1.75rem'}}>Reset Password</h2>
            <p className="text-subtitle" style={{margin: '0 auto'}}>
              Set your new password below.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>

            {/* New Password */}
            <div className="form-group" style={{margin: 0}}>
              <label className="form-label">New Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
              />
            </div>

            {/* Confirm Password */}
            <div className="form-group" style={{margin: 0}}>
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="form-input"
              />
            </div>

            {/* Error Message */}
            {error && (
              <p style={{color: '#ef4444', fontSize: '0.875rem', fontWeight: '500'}}>{error}</p>
            )}

            {/* Success Message */}
            {success && (
              <p style={{color: '#16a34a', fontSize: '0.875rem', fontWeight: '500'}}>{success}</p>
            )}

            {/* Button */}
            <button type="submit" className="btn-primary btn-block" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          {/* Back to Login */}
          <p style={{marginTop: '2rem', textAlign: 'center', color: 'var(--text-secondary)'}}>
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

export default ResetPassword;
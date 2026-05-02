import Navbar from "../../components/common/Navbar";
import { useState  } from "react";
import { useNavigate } from "react-router-dom";
import { login, logout } from "../../services/authService";
import LoadingScreen from "../../components/common/LoadingScreen";

const Login = () => {
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
      const res = await login(email,password);
      if(res.role === "DOCTOR"){
        logout();
        setError("You are attempting to log in as a doctor. Redirecting to Provider Portal...");
        setTimeout(() => {
          setIsLoading(false);
          navigate("/doctor/login");
        }, 3000);
      } else if (res.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setIsLoading(false);
      setError(err.response?.data?.detail || "Login failed");
    }
  };

  const handleforgot = (e) => {
    e.preventDefault();
    navigate("/forgot-password");
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="page-container">
      <Navbar />

      <section className="auth-section">
        <div className="auth-card glass-panel">
          <div className="auth-header">
            <h2 className="auth-title">Welcome Back</h2>
            <p className="text-subtitle" style={{margin: '0 auto', fontSize: '1rem'}}>
              Login to manage your appointments and records securely
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
              <label className="form-label">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="form-input"
                onChange={(e)=>{setEmail(e.target.value)}}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="form-input"
                onChange={(e)=>{setPassword(e.target.value)}}
              />
            </div>

            <div className="form-options" style={{justifyContent: 'flex-end'}}>
              <a href="#" className="auth-link" onClick={handleforgot}>
                Forgot password?
              </a>
            </div>

            <button type="submit" className="btn-primary btn-block">
              Login Action
            </button>
          </form>

          <div className="divider">OR</div>

          <p style={{textAlign: 'center', color: 'var(--text-secondary)'}}>
            Don’t have an account?{" "}
            <a href="/register" className="auth-link" onClick={(e) => {
                e.preventDefault();
                navigate("/register");
            }}>
              Register here
            </a>
          </p>
        </div>
      </section>
    </div>
  );
};

export default Login;

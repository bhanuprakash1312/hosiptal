import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Navbar from "../../components/common/Navbar";
import LoadingScreen from "../../components/common/LoadingScreen";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.post("/auth/register", form);
      navigate("/verify-otp", {
        state: { email: form.email },
      });
    } catch (err) {
      setIsLoading(false);
      alert("Registration failed");
    }
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="page-container">
      <Navbar />

      <section className="auth-section">
        <form
          onSubmit={submit}
          className="auth-card glass-panel"
          style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}
        >
          <div className="auth-header">
            <h2 className="auth-title">Register</h2>
          </div>

          <div className="form-group" style={{margin: 0}}>
            <input
              placeholder="Name"
              className="form-input"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="form-group" style={{margin: 0}}>
            <input
              placeholder="Email"
              className="form-input"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="form-group" style={{margin: 0}}>
            <input
              placeholder="Phone"
              className="form-input"
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          <button className="btn-primary btn-block" style={{marginTop: '1rem'}}>
            Send OTP
          </button>
        </form>
      </section>
    </div>
  );
};

export default Register;

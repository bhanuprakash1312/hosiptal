import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../services/api";

const CompleteRegistration = () => {
  const { state } = useLocation(); // { email }
  const navigate = useNavigate();

  const [data, setData] = useState({
    password: "",
    gender: "",
    date_of_birth: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    blood_group: "",
    emergency_contact: "",
    existing_conditions: "",
  });

  const handleChange = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const submit = async () => {
    await api.post("/auth/complete-registration", {
      email: state.email,
      password: data.password,
      patient: {
        gender: data.gender,
        date_of_birth: data.date_of_birth,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        blood_group: data.blood_group || null,
        emergency_contact: data.emergency_contact,
        existing_conditions: data.existing_conditions || null,
      },
    });

    navigate("/login");
  };

  return (
    <div className="page-container">
      <section className="auth-section">
        <div className="auth-card glass-panel" style={{maxWidth: '800px'}}>

          <div className="auth-header">
            <h2 className="auth-title">Complete Registration</h2>
            <p className="text-subtitle" style={{margin: '0 auto'}}>
              Fill in your details to complete your patient profile
            </p>
          </div>

          <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
            {/* PASSWORD */}
            <input
              type="password"
              placeholder="Create Password"
              className="form-input"
              onChange={(e) => handleChange("password", e.target.value)}
            />

            {/* GENDER + DOB */}
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem'}}>
              <select
                className="form-input"
                onChange={(e) => handleChange("gender", e.target.value)}
              >
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>

              <input
                type="date"
                className="form-input"
                onChange={(e) => handleChange("date_of_birth", e.target.value)}
              />
            </div>

            {/* ADDRESS */}
            <input
              placeholder="Address"
              className="form-input"
              onChange={(e) => handleChange("address", e.target.value)}
            />

            {/* CITY + STATE */}
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem'}}>
              <input
                placeholder="City"
                className="form-input"
                onChange={(e) => handleChange("city", e.target.value)}
              />
              <input
                placeholder="State"
                className="form-input"
                onChange={(e) => handleChange("state", e.target.value)}
              />
            </div>

            {/* PINCODE + BLOOD GROUP */}
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem'}}>
              <input
                placeholder="Pincode"
                className="form-input"
                onChange={(e) => handleChange("pincode", e.target.value)}
              />

              <select
                className="form-input"
                onChange={(e) => handleChange("blood_group", e.target.value)}
              >
                <option value="">Blood Group (Optional)</option>
                <option>A+</option><option>A-</option>
                <option>B+</option><option>B-</option>
                <option>O+</option><option>O-</option>
                <option>AB+</option><option>AB-</option>
              </select>
            </div>

            {/* EMERGENCY CONTACT */}
            <input
              placeholder="Emergency Contact Number"
              className="form-input"
              onChange={(e) => handleChange("emergency_contact", e.target.value)}
            />

            {/* EXISTING CONDITIONS */}
            <textarea
              rows={3}
              placeholder="Existing Conditions (Optional)"
              className="form-input"
              style={{resize: 'none'}}
              onChange={(e) => handleChange("existing_conditions", e.target.value)}
            />

            {/* SUBMIT */}
            <button onClick={submit} className="btn-primary btn-block" style={{marginTop: '1rem'}}>
              Complete Registration
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CompleteRegistration;

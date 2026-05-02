import React from "react";
import Navbar from "../components/common/Navbar";
import heroImg from "../assets/doctor.png";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const movepage = () => {
    navigate("/register");
  };

  return (
    <div className="page-container">
      <Navbar />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-glass glass-panel">
          
          <div className="hero-content">
            <h1 className="title-hero">
              Book Hospital Appointments
              <span className="text-gradient">Hassle-Free</span>
            </h1>

            <p className="text-subtitle" style={{marginBottom: '2.5rem'}}>
              A modern medical appointment system that helps patients book
              their consultations easily while hospitals manage their schedules dynamically.
            </p>

            <div className="hero-actions">
              <button className="btn-primary" onClick={movepage}>
                Get Started
              </button>
              <button className="btn-secondary">
                Learn More
              </button>
            </div>
          </div>

          <div className="hero-image">
            <img
              src={heroImg}
              alt="Doctor"
              className="hero-img-element"
            />
          </div>

        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Why Choose MediBook</h2>

        <div className="features-grid">
          {[
            {
              title: "Easy Booking",
              desc: "Book appointments in just a few clicks anytime, from anywhere with our beautiful interface.",
              icon: "📅"
            },
            {
              title: "Doctor Availability",
              desc: "View real-time schedules of top doctors and ensure you get the best medical care immediately.",
              icon: "👨‍⚕️"
            },
            {
              title: "Smart Management",
              desc: "Manage doctors, departments, and user access securely with our AI-powered admin dashboard.",
              icon: "⚙️"
            },
          ].map((feature, idx) => (
            <div key={idx} className="feature-card glass-panel" style={{animationDelay: `${idx * 0.2}s`, animationFillMode: 'both', animationName: 'fadeInUp'}}>
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-desc">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="features-section" style={{paddingTop: '2rem', paddingBottom: '8rem'}}>
        <div className="glass-panel" style={{maxWidth: '1200px', margin: '0 auto', padding: '4rem'}}>
          <h2 className="section-title" style={{marginBottom: '3rem'}}>How It Works</h2>

          <div className="features-grid" style={{gap: '1.5rem'}}>
            {[
              "Register your account securely",
              "Choose department & preferred doctor",
              "Confirm your appointment in seconds",
            ].map((step, idx) => (
              <div key={idx} style={{textAlign: 'center', padding: '1rem'}}>
                <div className="text-gradient" style={{fontSize: '3rem', fontWeight: '800', marginBottom: '1rem'}}>
                  {idx + 1}
                </div>
                <p className="feature-desc" style={{fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: '500'}}>{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;

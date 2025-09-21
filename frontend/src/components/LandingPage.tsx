import React from "react";
import { Link } from "react-router-dom";

const LandingPage: React.FC = () => {
  return (
    <div className="landing-page">
      <div className="hero-section">
        <h1>Leave Management System</h1>
        <p>Manage your leave requests efficiently</p>
        <div className="auth-buttons">
          <Link to="/login" className="btn btn-primary">
            Employee Login
          </Link>
          <Link to="/admin/login" className="btn btn-secondary">
            HR Admin Login
          </Link>
        </div>
      </div>
      
      <div className="features-section">
        <div className="container">
          <h2>Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>For Employees</h3>
              <ul>
                <li>Apply for leave requests</li>
                <li>Track leave status</li>
                <li>View leave history</li>
                <li>Dashboard overview</li>
              </ul>
            </div>
            <div className="feature-card">
              <h3>For HR Admins</h3>
              <ul>
                <li>Review leave requests</li>
                <li>Approve/Reject applications</li>
                <li>Manage employee data</li>
                <li>Generate reports</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;


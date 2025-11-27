import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  const isAdminRoute = window.location.pathname.startsWith('/admin');
  
  if (isAdminRoute) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="container">
        <Link to={isAdminRoute ? "/admin" : "/dashboard"} className="navbar-brand">
          Leave Management System
        </Link>

        <ul className="navbar-nav">
          {user.role === "hr" ? (
            <>
              <li>
                <Link to="/admin">Admin Dashboard</Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/dashboard">Dashboard</Link>
              </li>
              <li>
                <Link to="/apply-leave">Apply Leave</Link>
              </li>
              <li>
                <Link to="/my-leaves">My Leaves</Link>
              </li>
            </>
          )}
          <li>
            <span style={{ marginRight: "10px" }}>Welcome, {user.name}</span>
            <button
              onClick={logout}
              className="btn btn-secondary"
              style={{ padding: "5px 10px", fontSize: "14px" }}
            >
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;

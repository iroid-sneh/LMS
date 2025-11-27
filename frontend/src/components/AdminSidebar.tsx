import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="admin-sidebar">
      <div className="admin-sidebar-header">
        <h2>Admin Panel</h2>
        <div className="admin-user-info">
          <div className="admin-user-avatar">
            {user?.name?.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="admin-user-details">
            <div className="admin-user-name">{user?.name || "Admin"}</div>
            <div className="admin-user-role">HR Manager</div>
          </div>
        </div>
      </div>

      <nav className="admin-sidebar-nav">
        <Link
          to="/admin"
          className={`admin-nav-item ${isActive("/admin") ? "active" : ""}`}
        >
          <span className="admin-nav-text">Dashboard</span>
        </Link>
        <Link
          to="/admin/manage-leaves"
          className={`admin-nav-item ${
            isActive("/admin/manage-leaves") ? "active" : ""
          }`}
        >
          <span className="admin-nav-text">Manage Leaves</span>
        </Link>
        <Link
          to="/admin/employees"
          className={`admin-nav-item ${
            isActive("/admin/employees") ? "active" : ""
          }`}
        >
          <span className="admin-nav-text">Employee Management</span>
        </Link>
      </nav>

      <div className="admin-sidebar-footer">
        <button onClick={logout} className="admin-logout-btn">
          <span className="admin-nav-text">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;


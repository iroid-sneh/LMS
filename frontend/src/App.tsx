import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import AdminDashboard from "./components/AdminDashboard";
import ManageLeaves from "./components/ManageLeaves";
import ApplyLeave from "./components/ApplyLeave";
import MyLeaves from "./components/MyLeaves";
import Navbar from "./components/Navbar";
import LandingPage from "./components/LandingPage";
import EmployeeManagement from "./components/EmployeeManagement";

const ProtectedRoute: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

const AdminProtectedRoute: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/admin/login" />;
  }

  if (user.role !== "hr") {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (user) {
    return <Navigate to={user.role === "hr" ? "/admin" : "/dashboard"} />;
  }

  return <>{children}</>;
};

const AdminPublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (user && user.role === "hr") {
    return <Navigate to="/admin" />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <div className="container">
            <Routes>
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/apply-leave"
                element={
                  <ProtectedRoute>
                    <ApplyLeave />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-leaves"
                element={
                  <ProtectedRoute>
                    <MyLeaves />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/login"
                element={
                  <AdminPublicRoute>
                    <Login isAdmin={true} />
                  </AdminPublicRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <AdminProtectedRoute>
                    <AdminDashboard />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/manage-leaves"
                element={
                  <AdminProtectedRoute>
                    <ManageLeaves />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/employees"
                element={
                  <AdminProtectedRoute>
                    <EmployeeManagement />
                  </AdminProtectedRoute>
                }
              />

              <Route path="/" element={<LandingPage />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
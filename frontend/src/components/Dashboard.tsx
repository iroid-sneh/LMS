import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

interface Leave {
  _id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  duration: number;
  durationUnit: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  appliedAt: string;
  adminComment?: string;
  rejectedReason?: string;
  employee?: {
    _id: string;
    name: string;
    email: string;
    employeeId: string;
    department: string;
    position: string;
  };
}

interface Stats {
  totalLeaves: number;
  approvedLeaves: number;
  pendingLeaves: number;
  rejectedLeaves: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [todayLeaves, setTodayLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, todayLeavesResponse] = await Promise.all([
        axios.get("/api/users/stats"),
        axios.get("/api/leaves/today"),
      ]);

      setStats(statsResponse.data);
      setTodayLeaves(todayLeavesResponse.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusClass = (status: string) => {
    return `status-${status}`;
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      <p>
        Employee ID: {user?.employeeId} | Department: {user?.department} |
        Position: {user?.position}
      </p>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h2>Quick Actions</h2>
        </div>
        <div className="d-flex justify-content-between">
          <Link to="/apply-leave" className="btn btn-primary">
            Apply for Leave
          </Link>
          <Link to="/my-leaves" className="btn btn-secondary">
            View My Leaves
          </Link>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="dashboard-grid">
          <div className="stats-card">
            <h3>Total Leaves</h3>
            <div className="number">{stats.totalLeaves}</div>
          </div>
          <div className="stats-card">
            <h3>Approved</h3>
            <div className="number" style={{ color: "#28a745" }}>
              {stats.approvedLeaves}
            </div>
          </div>
          <div className="stats-card">
            <h3>Pending</h3>
            <div className="number" style={{ color: "#ffc107" }}>
              {stats.pendingLeaves}
            </div>
          </div>
          <div className="stats-card">
            <h3>Rejected</h3>
            <div className="number" style={{ color: "#dc3545" }}>
              {stats.rejectedLeaves}
            </div>
          </div>
        </div>
      )}

      {/* Today's Leaves */}
      <div className="card">
        <div className="card-header">
          <h2>Employees on Leave Today</h2>
        </div>
        {todayLeaves.length === 0 ? (
          <p>No employees are on leave today.</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Leave Type</th>
                  <th>Duration</th>
                  <th>Reason</th>
                  <th>End Date</th>
                </tr>
              </thead>
              <tbody>
                {todayLeaves.map((leave) => (
                  <tr key={leave._id}>
                    <td>{leave.employee?.name}</td>
                    <td>{leave.employee?.department}</td>
                    <td>{leave.leaveType}</td>
                    <td>
                      {leave.duration} {leave.durationUnit}
                    </td>
                    <td>{leave.reason}</td>
                    <td>{formatDate(leave.endDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

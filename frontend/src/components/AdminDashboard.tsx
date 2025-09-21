import React, { useState, useEffect } from "react";
import axios from "axios";

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
  employee: {
    name: string;
    email: string;
    employeeId: string;
    department: string;
    position: string;
  };
  reviewedBy?: {
    name: string;
    email: string;
  };
  reviewedAt?: string;
}

interface AdminStats {
  totalEmployees: number;
  totalLeaves: number;
  pendingLeaves: number;
  approvedLeaves: number;
  rejectedLeaves: number;
  todayLeaves: number;
  todayLeavesDetails: Leave[];
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingLeaves, setPendingLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [statsResponse, pendingResponse] = await Promise.all([
        axios.get("/api/users/admin-stats"),
        axios.get("/api/leaves/all"),
      ]);

      setStats(statsResponse.data);
      setPendingLeaves(
        pendingResponse.data.filter(
          (leave: Leave) => leave.status === "pending",
        ),
      );
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (leaveId: string, adminComment: string = "") => {
    try {
      await axios.put(`/api/leaves/${leaveId}/approve`, { adminComment });
      await fetchAdminData();
      alert("Leave request approved successfully!");
    } catch (error) {
      console.error("Error approving leave:", error);
      alert("Failed to approve leave request");
    }
  };

  const handleReject = async (
    leaveId: string,
    rejectedReason: string,
    adminComment: string = "",
  ) => {
    if (!rejectedReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    try {
      await axios.put(`/api/leaves/${leaveId}/reject`, {
        rejectedReason,
        adminComment,
      });
      await fetchAdminData();
      alert("Leave request rejected successfully!");
    } catch (error) {
      console.error("Error rejecting leave:", error);
      alert("Failed to reject leave request");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div>
      <h1>HR Admin Dashboard</h1>

      {/* Statistics */}
      {stats && (
        <div className="dashboard-grid">
          <div className="stats-card">
            <h3>Total Employees</h3>
            <div className="number">{stats.totalEmployees}</div>
          </div>
          <div className="stats-card">
            <h3>Total Leaves</h3>
            <div className="number">{stats.totalLeaves}</div>
          </div>
          <div className="stats-card">
            <h3>Pending Requests</h3>
            <div className="number" style={{ color: "#ffc107" }}>
              {stats.pendingLeaves}
            </div>
          </div>
          <div className="stats-card">
            <h3>Approved</h3>
            <div className="number" style={{ color: "#28a745" }}>
              {stats.approvedLeaves}
            </div>
          </div>
          <div className="stats-card">
            <h3>Rejected</h3>
            <div className="number" style={{ color: "#dc3545" }}>
              {stats.rejectedLeaves}
            </div>
          </div>
          <div className="stats-card">
            <h3>On Leave Today</h3>
            <div className="number" style={{ color: "#17a2b8" }}>
              {stats.todayLeaves}
            </div>
          </div>
        </div>
      )}

      {/* Pending Leave Requests */}
      <div className="card">
        <div className="card-header">
          <h2>Pending Leave Requests</h2>
        </div>
        {pendingLeaves.length === 0 ? (
          <p>No pending leave requests.</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Leave Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Duration</th>
                  <th>Reason</th>
                  <th>Applied Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingLeaves.map((leave) => (
                  <tr key={leave._id}>
                    <td>
                      <div>
                        <strong>{leave.employee.name}</strong>
                        <br />
                        <small>{leave.employee.employeeId}</small>
                      </div>
                    </td>
                    <td>{leave.employee.department}</td>
                    <td>{leave.leaveType}</td>
                    <td>{formatDate(leave.startDate)}</td>
                    <td>{formatDate(leave.endDate)}</td>
                    <td>
                      {leave.duration} {leave.durationUnit}
                    </td>
                    <td>
                      <div
                        style={{ maxWidth: "200px", wordWrap: "break-word" }}
                      >
                        {leave.reason}
                      </div>
                    </td>
                    <td>{formatDateTime(leave.appliedAt)}</td>
                    <td>
                      <div className="d-flex">
                        <button
                          className="btn btn-success"
                          style={{
                            padding: "5px 10px",
                            fontSize: "12px",
                            marginRight: "5px",
                          }}
                          onClick={() => {
                            const comment = prompt(
                              "Add admin comment (optional):",
                            );
                            handleApprove(leave._id, comment || "");
                          }}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: "5px 10px", fontSize: "12px" }}
                          onClick={() => {
                            const reason = prompt("Reason for rejection:");
                            if (reason) {
                              const comment = prompt(
                                "Add admin comment (optional):",
                              );
                              handleReject(leave._id, reason, comment || "");
                            }
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Today's Leaves */}
      {stats && stats.todayLeavesDetails.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2>Employees on Leave Today</h2>
          </div>
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
                {stats.todayLeavesDetails.map((leave) => (
                  <tr key={leave._id}>
                    <td>{leave.employee.name}</td>
                    <td>{leave.employee.department}</td>
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
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

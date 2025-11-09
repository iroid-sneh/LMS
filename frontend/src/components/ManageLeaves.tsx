import React, { useState, useEffect } from "react";
import api from "../config/axios";
import AdminSidebar from "./AdminSidebar";

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

type TabType = "pending" | "approved" | "rejected";

const ManageLeaves: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("pending");
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectComment, setRejectComment] = useState("");
  const [selectedLeaveId, setSelectedLeaveId] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const response = await api.get("/leaves/all");
      setLeaves(response.data);
    } catch (error) {
      console.error("Error fetching leaves:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (leaveId: string, adminComment: string = "") => {
    try {
      await api.put(`/leaves/${leaveId}/approve`, { adminComment });
      await fetchLeaves();
      alert("Leave request approved successfully!");
    } catch (error) {
      console.error("Error approving leave:", error);
      alert("Failed to approve leave request");
    }
  };

  const handleReject = async (
    leaveId: string,
    rejectedReason: string,
    adminComment: string = ""
  ) => {
    if (!rejectedReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    try {
      await api.put(`/leaves/${leaveId}/reject`, {
        rejectedReason,
        adminComment,
      });
      await fetchLeaves();
      alert("Leave request rejected successfully!");
      setSelectedLeaveId(null);
      setRejectReason("");
      setRejectComment("");
    } catch (error) {
      console.error("Error rejecting leave:", error);
      alert("Failed to reject leave request");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getFilteredLeaves = () => {
    return leaves.filter((leave) => leave.status === activeTab);
  };

  const getCounts = () => {
    return {
      pending: leaves.filter((l) => l.status === "pending").length,
      approved: leaves.filter((l) => l.status === "approved").length,
      rejected: leaves.filter((l) => l.status === "rejected").length,
    };
  };

  const counts = getCounts();
  const filteredLeaves = getFilteredLeaves();

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <div className="manage-leaves-container">
          <div className="manage-leaves-header">
            <h1>Manage Leave Requests</h1>
          </div>

          <div className="leave-tabs">
            <button
              className={`leave-tab ${activeTab === "pending" ? "active" : ""}`}
              onClick={() => setActiveTab("pending")}
            >
              <span className="tab-text">Pending Requests</span>
              {counts.pending > 0 && (
                <span className="tab-badge pending">{counts.pending}</span>
              )}
            </button>
            <button
              className={`leave-tab ${activeTab === "approved" ? "active" : ""}`}
              onClick={() => setActiveTab("approved")}
            >
              <span className="tab-text">Approved</span>
              {counts.approved > 0 && (
                <span className="tab-badge approved">{counts.approved}</span>
              )}
            </button>
            <button
              className={`leave-tab ${activeTab === "rejected" ? "active" : ""}`}
              onClick={() => setActiveTab("rejected")}
            >
              <span className="tab-text">Rejected</span>
              {counts.rejected > 0 && (
                <span className="tab-badge rejected">{counts.rejected}</span>
              )}
            </button>
          </div>

          <div className="leaves-table-container">
            {filteredLeaves.length === 0 ? (
              <div className="no-leaves-message">
                <p>No {activeTab} leave requests found.</p>
              </div>
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
                      <th>Applied At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeaves.map((leave) => (
                      <tr key={leave._id}>
                        <td>
                          <div className="employee-info">
                            <strong>{leave.employee.name}</strong>
                            <small>{leave.employee.email}</small>
                          </div>
                        </td>
                        <td>{leave.employee.department}</td>
                        <td>
                          <span className="leave-type-badge">{leave.leaveType}</span>
                        </td>
                        <td>{formatDate(leave.startDate)}</td>
                        <td>{formatDate(leave.endDate)}</td>
                        <td>
                          {leave.duration} {leave.durationUnit}
                        </td>
                        <td>
                          <div className="reason-cell">{leave.reason}</div>
                        </td>
                        <td>{formatDateTime(leave.appliedAt)}</td>
                        <td>
                          {leave.status === "pending" ? (
                            <div className="action-buttons">
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => {
                                  const comment = prompt(
                                    "Add admin comment (optional):"
                                  );
                                  handleApprove(leave._id, comment || "");
                                }}
                              >
                                Approve
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => setSelectedLeaveId(leave._id)}
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span
                              className={`status-badge ${
                                leave.status === "approved" ? "approved" : "rejected"
                              }`}
                            >
                              {leave.status}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Reject Modal */}
          {selectedLeaveId && (
            <div className="modal-overlay" onClick={() => setSelectedLeaveId(null)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>Reject Leave Request</h3>
                <div className="form-group">
                  <label>Rejection Reason *</label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Enter reason for rejection"
                    rows={4}
                  />
                </div>
                <div className="form-group">
                  <label>Admin Comment (Optional)</label>
                  <textarea
                    value={rejectComment}
                    onChange={(e) => setRejectComment(e.target.value)}
                    placeholder="Add any additional comments"
                    rows={3}
                  />
                </div>
                <div className="modal-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setSelectedLeaveId(null);
                      setRejectReason("");
                      setRejectComment("");
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() =>
                      handleReject(selectedLeaveId, rejectReason, rejectComment)
                    }
                  >
                    Reject Leave
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageLeaves;


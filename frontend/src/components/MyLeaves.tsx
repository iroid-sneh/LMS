import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../config/axios";

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
    reviewedBy?: {
        name: string;
        email: string;
    };
    reviewedAt?: string;
}

const MyLeaves: React.FC = () => {
    const navigate = useNavigate();
    const [leaves, setLeaves] = useState<Leave[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingLeave, setEditingLeave] = useState<Leave | null>(null);
    const [editForm, setEditForm] = useState({
        leaveType: "",
        startDate: "",
        endDate: "",
        reason: "",
    });

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        try {
            const response = await api.get("/leaves/my-leaves");
            setLeaves(response.data);
        } catch (error) {
            console.error("Error fetching leaves:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (leaveId: string) => {
        if (!window.confirm("Are you sure you want to cancel this leave request?")) {
            return;
        }

        try {
            await api.delete(`/leaves/${leaveId}`);
            await fetchLeaves();
            alert("Leave request cancelled successfully");
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to cancel leave request");
        }
    };

    const handleEdit = (leave: Leave) => {
        setEditingLeave(leave);
        setEditForm({
            leaveType: leave.leaveType,
            startDate: leave.startDate.split("T")[0],
            endDate: leave.endDate.split("T")[0],
            reason: leave.reason,
        });
    };

    const handleUpdate = async () => {
        if (!editingLeave) return;

        try {
            await api.put(`/leaves/${editingLeave._id}`, editForm);
            await fetchLeaves();
            setEditingLeave(null);
            alert("Leave request updated successfully");
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to update leave request");
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const getStatusClass = (status: string) => {
        return `status-${status}`;
    };

    const getStatusText = (status: string) => {
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    if (loading) {
        return <div className="text-center">Loading...</div>;
    }

    return (
        <div>
            <h1>My Leave Requests</h1>

            {leaves.length === 0 ? (
                <div className="card">
                    <p>You haven't applied for any leaves yet.</p>
                </div>
            ) : (
                <div className="card">
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Leave Type</th>
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                    <th>Duration</th>
                                    <th>Reason</th>
                                    <th>Status</th>
                                    <th>Applied Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaves.map((leave) => (
                                    <tr key={leave._id}>
                                        <td>{leave.leaveType}</td>
                                        <td>{formatDate(leave.startDate)}</td>
                                        <td>{formatDate(leave.endDate)}</td>
                                        <td>
                                            {leave.duration}{" "}
                                            {leave.durationUnit}
                                        </td>
                                        <td>
                                            <div
                                                style={{
                                                    maxWidth: "200px",
                                                    wordWrap: "break-word",
                                                }}
                                            >
                                                {leave.reason}
                                            </div>
                                        </td>
                                        <td>
                                            <span
                                                className={getStatusClass(
                                                    leave.status
                                                )}
                                            >
                                                {getStatusText(leave.status)}
                                            </span>
                                        </td>
                                        <td>
                                            {formatDateTime(leave.appliedAt)}
                                        </td>
                                        <td>
                                            <div className="d-flex">
                                                <button
                                                    className="btn btn-secondary"
                                                    style={{
                                                        padding: "5px 10px",
                                                        fontSize: "12px",
                                                        marginRight: "5px",
                                                    }}
                                                    onClick={() => {
                                                        const details = `
Leave Details:
Type: ${leave.leaveType}
Start Date: ${formatDate(leave.startDate)}
End Date: ${formatDate(leave.endDate)}
Duration: ${leave.duration} ${leave.durationUnit}
Reason: ${leave.reason}
Status: ${getStatusText(leave.status)}
Applied Date: ${formatDateTime(leave.appliedAt)}
${leave.adminComment ? `Admin Comment: ${leave.adminComment}` : ""}
${leave.rejectedReason ? `Rejection Reason: ${leave.rejectedReason}` : ""}
${leave.reviewedBy ? `Reviewed By: ${leave.reviewedBy.name}` : ""}
${leave.reviewedAt ? `Reviewed At: ${formatDateTime(leave.reviewedAt)}` : ""}
                          `;
                                                        alert(details);
                                                    }}
                                                >
                                                    View Details
                                                </button>
                                                {leave.status === "pending" && (
                                                    <>
                                                        <button
                                                            className="btn btn-primary"
                                                            style={{
                                                                padding: "5px 10px",
                                                                fontSize: "12px",
                                                                marginRight: "5px",
                                                            }}
                                                            onClick={() => handleEdit(leave)}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            className="btn btn-danger"
                                                            style={{
                                                                padding: "5px 10px",
                                                                fontSize: "12px",
                                                            }}
                                                            onClick={() => handleCancel(leave._id)}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {editingLeave && (
                <div className="card" style={{ marginTop: "20px" }}>
                    <div className="card-header">
                        <h2>Edit Leave Request</h2>
                    </div>
                    <div className="card-body">
                        <div className="form-group">
                            <label>Leave Type</label>
                            <select
                                value={editForm.leaveType}
                                onChange={(e) =>
                                    setEditForm({ ...editForm, leaveType: e.target.value })
                                }
                            >
                                <option value="sick">Sick Leave</option>
                                <option value="vacation">Vacation</option>
                                <option value="personal">Personal</option>
                                <option value="emergency">Emergency</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Start Date</label>
                            <input
                                type="date"
                                value={editForm.startDate}
                                onChange={(e) =>
                                    setEditForm({ ...editForm, startDate: e.target.value })
                                }
                            />
                        </div>
                        <div className="form-group">
                            <label>End Date</label>
                            <input
                                type="date"
                                value={editForm.endDate}
                                onChange={(e) =>
                                    setEditForm({ ...editForm, endDate: e.target.value })
                                }
                            />
                        </div>
                        <div className="form-group">
                            <label>Reason</label>
                            <textarea
                                value={editForm.reason}
                                onChange={(e) =>
                                    setEditForm({ ...editForm, reason: e.target.value })
                                }
                                rows={4}
                            />
                        </div>
                        <div className="d-flex">
                            <button
                                className="btn btn-primary"
                                onClick={handleUpdate}
                            >
                                Update
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setEditingLeave(null)}
                                style={{ marginLeft: "10px" }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyLeaves;

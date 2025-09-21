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
  reviewedBy?: {
    name: string;
    email: string;
  };
  reviewedAt?: string;
}

const MyLeaves: React.FC = () => {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const response = await axios.get("/api/leaves/my-leaves");
      setLeaves(response.data);
    } catch (error) {
      console.error("Error fetching leaves:", error);
    } finally {
      setLoading(false);
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
                      {leave.duration} {leave.durationUnit}
                    </td>
                    <td>
                      <div
                        style={{ maxWidth: "200px", wordWrap: "break-word" }}
                      >
                        {leave.reason}
                      </div>
                    </td>
                    <td>
                      <span className={getStatusClass(leave.status)}>
                        {getStatusText(leave.status)}
                      </span>
                    </td>
                    <td>{formatDateTime(leave.appliedAt)}</td>
                    <td>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: "5px 10px", fontSize: "12px" }}
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
                    </td>
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

export default MyLeaves;

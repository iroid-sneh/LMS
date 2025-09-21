import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../config/axios";

const ApplyLeave: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        leaveType: "",
        startDate: "",
        endDate: "",
        duration: "",
        durationUnit: "days",
        reason: "",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const calculateDuration = () => {
        if (formData.startDate && formData.endDate) {
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            setFormData((prev) => ({ ...prev, duration: diffDays.toString() }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (
            !formData.leaveType ||
            !formData.startDate ||
            !formData.endDate ||
            !formData.reason
        ) {
            setError("Please fill in all required fields");
            return;
        }

        if (formData.reason.length < 10) {
            setError("Reason must be at least 10 characters long");
            return;
        }

        const startDate = new Date(formData.startDate);
        const endDate = new Date(formData.endDate);

        if (startDate >= endDate) {
            setError("End date must be after start date");
            return;
        }

        if (startDate < new Date()) {
            setError("Cannot apply for leave in the past");
            return;
        }

        setLoading(true);

        try {
            await api.post("/leaves", {
                ...formData,
                duration: parseFloat(formData.duration),
            });

            setSuccess("Leave application submitted successfully!");
            setTimeout(() => {
                navigate("/my-leaves");
            }, 2000);
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                    "Failed to submit leave application"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Apply for Leave</h1>

            {error && <div className="alert alert-danger">{error}</div>}

            {success && <div className="alert alert-success">{success}</div>}

            <div className="card">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="leaveType">Leave Type *</label>
                        <select
                            id="leaveType"
                            name="leaveType"
                            value={formData.leaveType}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Leave Type</option>
                            <option value="sick">Sick Leave</option>
                            <option value="vacation">Vacation</option>
                            <option value="personal">Personal</option>
                            <option value="emergency">Emergency</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="startDate">Start Date *</label>
                        <input
                            type="date"
                            id="startDate"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleChange}
                            onBlur={calculateDuration}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="endDate">End Date *</label>
                        <input
                            type="date"
                            id="endDate"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleChange}
                            onBlur={calculateDuration}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="duration">Duration</label>
                        <div className="d-flex">
                            <input
                                type="number"
                                id="duration"
                                name="duration"
                                value={formData.duration}
                                onChange={handleChange}
                                step="0.5"
                                min="0.5"
                                style={{ marginRight: "10px" }}
                                readOnly
                            />
                            <select
                                name="durationUnit"
                                value={formData.durationUnit}
                                onChange={handleChange}
                            >
                                <option value="days">Days</option>
                                <option value="hours">Hours</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="reason">Reason *</label>
                        <textarea
                            id="reason"
                            name="reason"
                            value={formData.reason}
                            onChange={handleChange}
                            placeholder="Please provide a detailed reason for your leave request..."
                            required
                        />
                    </div>

                    <div className="d-flex justify-content-between">
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? "Submitting..." : "Submit Leave Request"}
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => navigate("/dashboard")}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ApplyLeave;

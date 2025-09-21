const { useState, useEffect, createContext, useContext } = React;
const { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } =
    ReactRouterDOM;

// Auth Context
const AuthContext = createContext();

const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

// Auth Provider Component
const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            fetchUser();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUser = async () => {
        try {
            const response = await axios.get("/api/auth/me");
            setUser(response.data.user);
        } catch (error) {
            localStorage.removeItem("token");
            delete axios.defaults.headers.common["Authorization"];
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await axios.post("/api/auth/login", {
                email,
                password,
            });
            const { token, user: userData } = response.data;

            localStorage.setItem("token", token);
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            setUser(userData);
        } catch (error) {
            throw new Error(error.response?.data?.message || "Login failed");
        }
    };

    const register = async (userData) => {
        try {
            const response = await axios.post("/api/auth/register", userData);
            const { token, user: newUser } = response.data;

            localStorage.setItem("token", token);
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            setUser(newUser);
        } catch (error) {
            throw new Error(
                error.response?.data?.message || "Registration failed"
            );
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        delete axios.defaults.headers.common["Authorization"];
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{ user, login, register, logout, loading }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="text-center" style={{ padding: "50px" }}>
                <div className="loading"></div>
                <p style={{ marginTop: "20px" }}>Loading...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    return children;
};

// Admin Protected Route Component
const AdminProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="text-center" style={{ padding: "50px" }}>
                <div className="loading"></div>
                <p style={{ marginTop: "20px" }}>Loading...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/admin/login" />;
    }

    if (user.role !== "hr") {
        return <Navigate to="/dashboard" />;
    }

    return children;
};

// Public Route Component
const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="text-center" style={{ padding: "50px" }}>
                <div className="loading"></div>
                <p style={{ marginTop: "20px" }}>Loading...</p>
            </div>
        );
    }

    if (user) {
        return <Navigate to={user.role === "hr" ? "/admin" : "/dashboard"} />;
    }

    return children;
};

// Admin Public Route Component
const AdminPublicRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="text-center" style={{ padding: "50px" }}>
                <div className="loading"></div>
                <p style={{ marginTop: "20px" }}>Loading...</p>
            </div>
        );
    }

    if (user && user.role === "hr") {
        return <Navigate to="/admin" />;
    }

    return children;
};

// Navbar Component
const Navbar = () => {
    const { user, logout } = useAuth();

    if (!user) {
        return null;
    }

    const isAdminRoute = window.location.pathname.startsWith("/admin");

    return (
        <nav className="navbar">
            <div className="container">
                <Link
                    to={isAdminRoute ? "/admin" : "/dashboard"}
                    className="navbar-brand"
                >
                    <i className="fas fa-calendar-alt"></i>
                    Leave Management System
                </Link>

                <ul className="navbar-nav">
                    {user.role === "hr" ? (
                        <>
                            <li>
                                <Link to="/admin">
                                    <i className="fas fa-tachometer-alt"></i>{" "}
                                    Admin Dashboard
                                </Link>
                            </li>
                        </>
                    ) : (
                        <>
                            <li>
                                <Link to="/dashboard">
                                    <i className="fas fa-home"></i> Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link to="/apply-leave">
                                    <i className="fas fa-plus"></i> Apply Leave
                                </Link>
                            </li>
                            <li>
                                <Link to="/my-leaves">
                                    <i className="fas fa-list"></i> My Leaves
                                </Link>
                            </li>
                        </>
                    )}
                    <li>
                        <span style={{ marginRight: "15px", color: "#e9ecef" }}>
                            <i className="fas fa-user"></i> Welcome, {user.name}
                        </span>
                        <button
                            onClick={logout}
                            className="btn btn-secondary"
                            style={{ padding: "8px 16px", fontSize: "14px" }}
                        >
                            <i className="fas fa-sign-out-alt"></i> Logout
                        </button>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

// Landing Page Component
const LandingPage = () => {
    return (
        <div className="landing-page">
            <div className="hero-section">
                <h1>Leave Management System</h1>
                <p>
                    Streamline your leave requests and approvals with our
                    comprehensive management platform
                </p>
                <div className="auth-buttons">
                    <Link to="/login" className="btn btn-primary">
                        <i className="fas fa-user"></i> Employee Login
                    </Link>
                    <Link to="/admin/login" className="btn btn-secondary">
                        <i className="fas fa-user-shield"></i> HR Admin Login
                    </Link>
                </div>
            </div>

            <div className="features-section">
                <div className="container">
                    <h2>Why Choose Our System?</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <h3>For Employees</h3>
                            <ul>
                                <li>
                                    <i className="fas fa-check"></i> Easy leave
                                    application process
                                </li>
                                <li>
                                    <i className="fas fa-check"></i> Real-time
                                    status tracking
                                </li>
                                <li>
                                    <i className="fas fa-check"></i> Complete
                                    leave history
                                </li>
                                <li>
                                    <i className="fas fa-check"></i> Interactive
                                    dashboard
                                </li>
                                <li>
                                    <i className="fas fa-check"></i>{" "}
                                    Mobile-friendly interface
                                </li>
                            </ul>
                        </div>
                        <div className="feature-card">
                            <h3>For HR Admins</h3>
                            <ul>
                                <li>
                                    <i className="fas fa-check"></i> Centralized
                                    request management
                                </li>
                                <li>
                                    <i className="fas fa-check"></i>{" "}
                                    Approve/Reject with comments
                                </li>
                                <li>
                                    <i className="fas fa-check"></i> Employee
                                    data management
                                </li>
                                <li>
                                    <i className="fas fa-check"></i>{" "}
                                    Comprehensive reporting
                                </li>
                                <li>
                                    <i className="fas fa-check"></i> Today's
                                    leave overview
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Login Component
const Login = ({ isAdmin = false }) => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await login(formData.email, formData.password);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <h2>
                <i className="fas fa-sign-in-alt"></i>{" "}
                {isAdmin ? "HR Admin Login" : "Employee Login"}
            </h2>
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="email">
                        <i className="fas fa-envelope"></i> Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="Enter your email address"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">
                        <i className="fas fa-lock"></i> Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="Enter your password"
                    />
                </div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                    style={{ width: "100%" }}
                >
                    {loading ? (
                        <>
                            <div className="loading"></div> Logging in...
                        </>
                    ) : (
                        <>
                            <i className="fas fa-sign-in-alt"></i> Login
                        </>
                    )}
                </button>
            </form>

            <div className="text-center mt-3">
                {!isAdmin ? (
                    <p>
                        Don't have an account?{" "}
                        <Link to="/register">Register here</Link>
                    </p>
                ) : (
                    <p>
                        <Link to="/login">Employee Login</Link>
                    </p>
                )}
            </div>
        </div>
    );
};

// Register Component
const Register = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        department: "",
        position: "",
        employeeId: "",
        phone: "",
        role: "employee",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            const { confirmPassword, ...registerData } = formData;
            await register(registerData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <h2>
                <i className="fas fa-user-plus"></i> Register
            </h2>
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="name">
                        <i className="fas fa-user"></i> Full Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Enter your full name"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email">
                        <i className="fas fa-envelope"></i> Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="Enter your email address"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="employeeId">
                        <i className="fas fa-id-card"></i> Employee ID
                    </label>
                    <input
                        type="text"
                        id="employeeId"
                        name="employeeId"
                        value={formData.employeeId}
                        onChange={handleChange}
                        required
                        placeholder="Enter your employee ID"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="department">
                        <i className="fas fa-building"></i> Department
                    </label>
                    <input
                        type="text"
                        id="department"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        required
                        placeholder="Enter your department"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="position">
                        <i className="fas fa-briefcase"></i> Position
                    </label>
                    <input
                        type="text"
                        id="position"
                        name="position"
                        value={formData.position}
                        onChange={handleChange}
                        required
                        placeholder="Enter your position"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="phone">
                        <i className="fas fa-phone"></i> Phone (Optional)
                    </label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="role">
                        <i className="fas fa-user-tag"></i> Role
                    </label>
                    <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                    >
                        <option value="employee">Employee</option>
                        <option value="hr">HR Admin</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="password">
                        <i className="fas fa-lock"></i> Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="Enter your password"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="confirmPassword">
                        <i className="fas fa-lock"></i> Confirm Password
                    </label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        placeholder="Confirm your password"
                    />
                </div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                    style={{ width: "100%" }}
                >
                    {loading ? (
                        <>
                            <div className="loading"></div> Registering...
                        </>
                    ) : (
                        <>
                            <i className="fas fa-user-plus"></i> Register
                        </>
                    )}
                </button>
            </form>

            <div className="text-center mt-3">
                <p>
                    Already have an account? <Link to="/login">Login here</Link>
                </p>
            </div>
        </div>
    );
};

// Dashboard Component
const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [todayLeaves, setTodayLeaves] = useState([]);
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

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="text-center" style={{ padding: "50px" }}>
                <div className="loading"></div>
                <p style={{ marginTop: "20px" }}>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div>
            <div className="card">
                <div className="card-header">
                    <h1>
                        <i className="fas fa-tachometer-alt"></i> Welcome,{" "}
                        {user?.name}
                    </h1>
                    <p style={{ margin: "10px 0 0 0", color: "#6c757d" }}>
                        <i className="fas fa-id-card"></i> Employee ID:{" "}
                        {user?.employeeId} |<i className="fas fa-building"></i>{" "}
                        Department: {user?.department} |
                        <i className="fas fa-briefcase"></i> Position:{" "}
                        {user?.position}
                    </p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
                <div className="card-header">
                    <h2>
                        <i className="fas fa-bolt"></i> Quick Actions
                    </h2>
                </div>
                <div className="d-flex justify-content-between">
                    <Link to="/apply-leave" className="btn btn-primary">
                        <i className="fas fa-plus"></i> Apply for Leave
                    </Link>
                    <Link to="/my-leaves" className="btn btn-secondary">
                        <i className="fas fa-list"></i> View My Leaves
                    </Link>
                </div>
            </div>

            {/* Statistics */}
            {stats && (
                <div className="dashboard-grid">
                    <div className="stats-card">
                        <h3>
                            <i className="fas fa-calendar-check"></i> Total
                            Leaves
                        </h3>
                        <div className="number">{stats.totalLeaves}</div>
                    </div>
                    <div className="stats-card">
                        <h3>
                            <i className="fas fa-check-circle"></i> Approved
                        </h3>
                        <div className="number" style={{ color: "#28a745" }}>
                            {stats.approvedLeaves}
                        </div>
                    </div>
                    <div className="stats-card">
                        <h3>
                            <i className="fas fa-clock"></i> Pending
                        </h3>
                        <div className="number" style={{ color: "#ffc107" }}>
                            {stats.pendingLeaves}
                        </div>
                    </div>
                    <div className="stats-card">
                        <h3>
                            <i className="fas fa-times-circle"></i> Rejected
                        </h3>
                        <div className="number" style={{ color: "#dc3545" }}>
                            {stats.rejectedLeaves}
                        </div>
                    </div>
                </div>
            )}

            {/* Today's Leaves */}
            <div className="card">
                <div className="card-header">
                    <h2>
                        <i className="fas fa-users"></i> Employees on Leave
                        Today
                    </h2>
                </div>
                {todayLeaves.length === 0 ? (
                    <p
                        style={{
                            textAlign: "center",
                            color: "#6c757d",
                            padding: "20px",
                        }}
                    >
                        <i className="fas fa-smile"></i> No employees are on
                        leave today.
                    </p>
                ) : (
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>
                                        <i className="fas fa-user"></i> Employee
                                    </th>
                                    <th>
                                        <i className="fas fa-building"></i>{" "}
                                        Department
                                    </th>
                                    <th>
                                        <i className="fas fa-calendar"></i>{" "}
                                        Leave Type
                                    </th>
                                    <th>
                                        <i className="fas fa-clock"></i>{" "}
                                        Duration
                                    </th>
                                    <th>
                                        <i className="fas fa-comment"></i>{" "}
                                        Reason
                                    </th>
                                    <th>
                                        <i className="fas fa-calendar-times"></i>{" "}
                                        End Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {todayLeaves.map((leave) => (
                                    <tr key={leave._id}>
                                        <td>
                                            <strong>
                                                {leave.employee?.name}
                                            </strong>
                                            <br />
                                            <small style={{ color: "#6c757d" }}>
                                                {leave.employee?.employeeId}
                                            </small>
                                        </td>
                                        <td>{leave.employee?.department}</td>
                                        <td>
                                            <span
                                                className={`status-${leave.leaveType}`}
                                            >
                                                {leave.leaveType
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    leave.leaveType.slice(1)}
                                            </span>
                                        </td>
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

// Apply Leave Component
const ApplyLeave = () => {
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

    const handleChange = (e) => {
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

    const handleSubmit = async (e) => {
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
            await axios.post("/api/leaves", {
                ...formData,
                duration: parseFloat(formData.duration),
            });

            setSuccess("Leave application submitted successfully!");
            setTimeout(() => {
                navigate("/my-leaves");
            }, 2000);
        } catch (err) {
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
            <div className="card">
                <div className="card-header">
                    <h1>
                        <i className="fas fa-plus-circle"></i> Apply for Leave
                    </h1>
                </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="card">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="leaveType">
                            <i className="fas fa-calendar-alt"></i> Leave Type *
                        </label>
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
                        <label htmlFor="startDate">
                            <i className="fas fa-calendar-plus"></i> Start Date
                            *
                        </label>
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
                        <label htmlFor="endDate">
                            <i className="fas fa-calendar-minus"></i> End Date *
                        </label>
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
                        <label htmlFor="duration">
                            <i className="fas fa-clock"></i> Duration
                        </label>
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
                        <label htmlFor="reason">
                            <i className="fas fa-comment"></i> Reason *
                        </label>
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
                            {loading ? (
                                <>
                                    <div className="loading"></div>{" "}
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-paper-plane"></i>{" "}
                                    Submit Leave Request
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => navigate("/dashboard")}
                        >
                            <i className="fas fa-times"></i> Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// My Leaves Component
const MyLeaves = () => {
    const [leaves, setLeaves] = useState([]);
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

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const getStatusClass = (status) => {
        return `status-${status}`;
    };

    const getStatusText = (status) => {
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    if (loading) {
        return (
            <div className="text-center" style={{ padding: "50px" }}>
                <div className="loading"></div>
                <p style={{ marginTop: "20px" }}>Loading your leaves...</p>
            </div>
        );
    }

    return (
        <div>
            <div className="card">
                <div className="card-header">
                    <h1>
                        <i className="fas fa-list-alt"></i> My Leave Requests
                    </h1>
                </div>
            </div>

            {leaves.length === 0 ? (
                <div className="card">
                    <p
                        style={{
                            textAlign: "center",
                            color: "#6c757d",
                            padding: "20px",
                        }}
                    >
                        <i className="fas fa-calendar-times"></i> You haven't
                        applied for any leaves yet.
                    </p>
                </div>
            ) : (
                <div className="card">
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>
                                        <i className="fas fa-calendar-alt"></i>{" "}
                                        Leave Type
                                    </th>
                                    <th>
                                        <i className="fas fa-calendar-plus"></i>{" "}
                                        Start Date
                                    </th>
                                    <th>
                                        <i className="fas fa-calendar-minus"></i>{" "}
                                        End Date
                                    </th>
                                    <th>
                                        <i className="fas fa-clock"></i>{" "}
                                        Duration
                                    </th>
                                    <th>
                                        <i className="fas fa-comment"></i>{" "}
                                        Reason
                                    </th>
                                    <th>
                                        <i className="fas fa-info-circle"></i>{" "}
                                        Status
                                    </th>
                                    <th>
                                        <i className="fas fa-calendar"></i>{" "}
                                        Applied Date
                                    </th>
                                    <th>
                                        <i className="fas fa-eye"></i> Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaves.map((leave) => (
                                    <tr key={leave._id}>
                                        <td>
                                            <span
                                                className={`status-${leave.leaveType}`}
                                            >
                                                {leave.leaveType
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    leave.leaveType.slice(1)}
                                            </span>
                                        </td>
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
                                            <button
                                                className="btn btn-secondary"
                                                style={{
                                                    padding: "8px 12px",
                                                    fontSize: "12px",
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
                                                <i className="fas fa-eye"></i>{" "}
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

// Admin Dashboard Component
const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [pendingLeaves, setPendingLeaves] = useState([]);
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
                    (leave) => leave.status === "pending"
                )
            );
        } catch (error) {
            console.error("Error fetching admin data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (leaveId, adminComment = "") => {
        try {
            await axios.put(`/api/leaves/${leaveId}/approve`, { adminComment });
            await fetchAdminData();
            alert("Leave request approved successfully!");
        } catch (error) {
            console.error("Error approving leave:", error);
            alert("Failed to approve leave request");
        }
    };

    const handleReject = async (leaveId, rejectedReason, adminComment = "") => {
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

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    if (loading) {
        return (
            <div className="text-center" style={{ padding: "50px" }}>
                <div className="loading"></div>
                <p style={{ marginTop: "20px" }}>Loading admin dashboard...</p>
            </div>
        );
    }

    return (
        <div>
            <div className="card">
                <div className="card-header">
                    <h1>
                        <i className="fas fa-user-shield"></i> HR Admin
                        Dashboard
                    </h1>
                </div>
            </div>

            {/* Statistics */}
            {stats && (
                <div className="dashboard-grid">
                    <div className="stats-card">
                        <h3>
                            <i className="fas fa-users"></i> Total Employees
                        </h3>
                        <div className="number">{stats.totalEmployees}</div>
                    </div>
                    <div className="stats-card">
                        <h3>
                            <i className="fas fa-calendar-check"></i> Total
                            Leaves
                        </h3>
                        <div className="number">{stats.totalLeaves}</div>
                    </div>
                    <div className="stats-card">
                        <h3>
                            <i className="fas fa-clock"></i> Pending Requests
                        </h3>
                        <div className="number" style={{ color: "#ffc107" }}>
                            {stats.pendingLeaves}
                        </div>
                    </div>
                    <div className="stats-card">
                        <h3>
                            <i className="fas fa-check-circle"></i> Approved
                        </h3>
                        <div className="number" style={{ color: "#28a745" }}>
                            {stats.approvedLeaves}
                        </div>
                    </div>
                    <div className="stats-card">
                        <h3>
                            <i className="fas fa-times-circle"></i> Rejected
                        </h3>
                        <div className="number" style={{ color: "#dc3545" }}>
                            {stats.rejectedLeaves}
                        </div>
                    </div>
                    <div className="stats-card">
                        <h3>
                            <i className="fas fa-calendar-day"></i> On Leave
                            Today
                        </h3>
                        <div className="number" style={{ color: "#17a2b8" }}>
                            {stats.todayLeaves}
                        </div>
                    </div>
                </div>
            )}

            {/* Pending Leave Requests */}
            <div className="card">
                <div className="card-header">
                    <h2>
                        <i className="fas fa-hourglass-half"></i> Pending Leave
                        Requests
                    </h2>
                </div>
                {pendingLeaves.length === 0 ? (
                    <p
                        style={{
                            textAlign: "center",
                            color: "#6c757d",
                            padding: "20px",
                        }}
                    >
                        <i className="fas fa-check-circle"></i> No pending leave
                        requests.
                    </p>
                ) : (
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>
                                        <i className="fas fa-user"></i> Employee
                                    </th>
                                    <th>
                                        <i className="fas fa-building"></i>{" "}
                                        Department
                                    </th>
                                    <th>
                                        <i className="fas fa-calendar-alt"></i>{" "}
                                        Leave Type
                                    </th>
                                    <th>
                                        <i className="fas fa-calendar-plus"></i>{" "}
                                        Start Date
                                    </th>
                                    <th>
                                        <i className="fas fa-calendar-minus"></i>{" "}
                                        End Date
                                    </th>
                                    <th>
                                        <i className="fas fa-clock"></i>{" "}
                                        Duration
                                    </th>
                                    <th>
                                        <i className="fas fa-comment"></i>{" "}
                                        Reason
                                    </th>
                                    <th>
                                        <i className="fas fa-calendar"></i>{" "}
                                        Applied Date
                                    </th>
                                    <th>
                                        <i className="fas fa-cogs"></i> Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingLeaves.map((leave) => (
                                    <tr key={leave._id}>
                                        <td>
                                            <div>
                                                <strong>
                                                    {leave.employee.name}
                                                </strong>
                                                <br />
                                                <small
                                                    style={{ color: "#6c757d" }}
                                                >
                                                    {leave.employee.employeeId}
                                                </small>
                                            </div>
                                        </td>
                                        <td>{leave.employee.department}</td>
                                        <td>
                                            <span
                                                className={`status-${leave.leaveType}`}
                                            >
                                                {leave.leaveType
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    leave.leaveType.slice(1)}
                                            </span>
                                        </td>
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
                                            {formatDateTime(leave.appliedAt)}
                                        </td>
                                        <td>
                                            <div className="d-flex">
                                                <button
                                                    className="btn btn-success"
                                                    style={{
                                                        padding: "8px 12px",
                                                        fontSize: "12px",
                                                        marginRight: "8px",
                                                    }}
                                                    onClick={() => {
                                                        const comment = prompt(
                                                            "Add admin comment (optional):"
                                                        );
                                                        handleApprove(
                                                            leave._id,
                                                            comment || ""
                                                        );
                                                    }}
                                                >
                                                    <i className="fas fa-check"></i>{" "}
                                                    Approve
                                                </button>
                                                <button
                                                    className="btn btn-danger"
                                                    style={{
                                                        padding: "8px 12px",
                                                        fontSize: "12px",
                                                    }}
                                                    onClick={() => {
                                                        const reason = prompt(
                                                            "Reason for rejection:"
                                                        );
                                                        if (reason) {
                                                            const comment =
                                                                prompt(
                                                                    "Add admin comment (optional):"
                                                                );
                                                            handleReject(
                                                                leave._id,
                                                                reason,
                                                                comment || ""
                                                            );
                                                        }
                                                    }}
                                                >
                                                    <i className="fas fa-times"></i>{" "}
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
                        <h2>
                            <i className="fas fa-calendar-day"></i> Employees on
                            Leave Today
                        </h2>
                    </div>
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>
                                        <i className="fas fa-user"></i> Employee
                                    </th>
                                    <th>
                                        <i className="fas fa-building"></i>{" "}
                                        Department
                                    </th>
                                    <th>
                                        <i className="fas fa-calendar-alt"></i>{" "}
                                        Leave Type
                                    </th>
                                    <th>
                                        <i className="fas fa-clock"></i>{" "}
                                        Duration
                                    </th>
                                    <th>
                                        <i className="fas fa-comment"></i>{" "}
                                        Reason
                                    </th>
                                    <th>
                                        <i className="fas fa-calendar-times"></i>{" "}
                                        End Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.todayLeavesDetails.map((leave) => (
                                    <tr key={leave._id}>
                                        <td>
                                            <strong>
                                                {leave.employee.name}
                                            </strong>
                                            <br />
                                            <small style={{ color: "#6c757d" }}>
                                                {leave.employee.employeeId}
                                            </small>
                                        </td>
                                        <td>{leave.employee.department}</td>
                                        <td>
                                            <span
                                                className={`status-${leave.leaveType}`}
                                            >
                                                {leave.leaveType
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    leave.leaveType.slice(1)}
                                            </span>
                                        </td>
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

// Main App Component
const App = () => {
    return (
        <AuthProvider>
            <BrowserRouter>
                <div className="App">
                    <Navbar />
                    <div className="container">
                        <Routes>
                            {/* Office User Routes */}
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

                            {/* Admin Routes */}
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

                            {/* Landing Page */}
                            <Route path="/" element={<LandingPage />} />
                        </Routes>
                    </div>
                </div>
            </BrowserRouter>
        </AuthProvider>
    );
};

// Render the app
ReactDOM.render(<App />, document.getElementById("root"));

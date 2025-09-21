const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const leaveRoutes = require("./routes/leaves");
const userRoutes = require("./routes/users");

dotenv.config();

const app = express();

// Middleware
app.use(
    cors({
        origin: ["http://localhost:5001"],
        credentials: true,
    })
);
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/users", userRoutes);

// Connect to MongoDB
mongoose
    .connect(
        process.env.MONGODB_URI ||
            "mongodb://localhost:27017/leave-management-system"
    )
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

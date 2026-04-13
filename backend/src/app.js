require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { sequelize } = require("./models");
const { migrator } = require("./db/migrator");

const authRoutes = require("./routes/auth");
const applicationRoutes = require("./routes/applications");
const userRoutes = require("./routes/users");
const qualificationRoutes = require("./routes/qualifications");
const moduleRoutes = require("./routes/modules");
const semesterRoutes = require("./routes/semesters");
const registrationRoutes = require("./routes/registrations");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/qualifications", qualificationRoutes);
app.use("/api/modules", moduleRoutes);
app.use("/api/semesters", semesterRoutes);
app.use("/api/registrations", registrationRoutes);

// Health check
app.get("/api/health", (_, res) => res.json({ status: "ok" }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 3000;

migrator()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`),
    );
  })
  .catch((err) => {
    console.error("Startup failed:", err.message);
    process.exit(1);
  });

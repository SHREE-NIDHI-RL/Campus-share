import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import authRoutes from "./routes/auth.js";
import resourceRoutes from "./routes/resources.js";
import borrowRoutes from "./routes/borrow.js";
import profileRoutes from "./routes/profile.js";
import ratingRoutes from "./routes/ratings.js";
import adminRoutes from "./routes/admin.js";
import userRoutes from "./routes/users.js";

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

// CORS (API routes only)
app.use("/api", cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      "http://localhost:8080",
      "http://localhost:8081",
      "http://localhost:3000",
      process.env.CLIENT_URL,
      process.env.RENDER_EXTERNAL_URL,
    ].filter(Boolean);

    const isAllowedRenderOrigin = /^https:\/\/.+\.onrender\.com$/i.test(origin || "");
    if (!origin || allowedOrigins.includes(origin) || isAllowedRenderOrigin) {
      callback(null, true);
    } else {
      console.error(`CORS blocked origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads
app.use("/uploads", express.static(join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/borrow", borrowRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok", timestamp: new Date() }));
// Serve React frontend
app.use(express.static(join(__dirname, "../dist")));

app.get("*", (req, res) => {
  res.sendFile(join(__dirname, "../dist/index.html"));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || "Internal server error" });
});

export default app;

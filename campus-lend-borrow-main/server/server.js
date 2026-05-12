import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import pool from "./config/db.js";
import { syncOverdueStatuses } from "./services/statusSync.js";

const PORT = process.env.PORT || 5000;

// Verify DB connection then start
pool.query("SELECT 1")
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 CampusShare server running on http://localhost:${PORT}`);
    });

    // Run overdue sync every hour
    syncOverdueStatuses();
    setInterval(syncOverdueStatuses, 60 * 60 * 1000);
  })
  .catch((err) => {
    console.error("❌ Cannot connect to PostgreSQL:", err.message);
    process.exit(1);
  });

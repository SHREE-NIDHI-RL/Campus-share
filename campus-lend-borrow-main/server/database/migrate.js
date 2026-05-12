import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import pool from "../config/db.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function migrateDatabase() {
  const sql = readFileSync(join(__dirname, "schema.sql"), "utf8");
  try {
    await pool.query(sql);
    console.log("✅ Database schema applied successfully");
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    throw err;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  migrateDatabase()
    .finally(() => pool.end())
    .catch(() => process.exit(1));
}

import pool from "../config/db.js";

const User = {
  findByEmail: async (email) => {
    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    return rows[0] || null;
  },

  findById: async (id) => {
    const { rows } = await pool.query(
      "SELECT id, full_name, email, phone, department, role, rating, trust_score, borrow_count, is_verified, is_blocked, created_at FROM users WHERE id = $1",
      [id]
    );
    return rows[0] || null;
  },

  create: async ({ full_name, email, password_hash, department, phone }) => {
    const { rows } = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, department, phone, is_verified)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING id, full_name, email, phone, department, role, rating, trust_score, borrow_count, is_verified, is_blocked, created_at`,
      [full_name, email, password_hash, department || null, phone || null]
    );
    return rows[0];
  },

  update: async (id, fields) => {
    const keys = Object.keys(fields);
    const values = Object.values(fields);
    const set = keys.map((k, i) => `${k} = $${i + 2}`).join(", ");
    const { rows } = await pool.query(
      `UPDATE users SET ${set} WHERE id = $1
       RETURNING id, full_name, email, phone, department, role, rating, trust_score, borrow_count, is_verified, is_blocked`,
      [id, ...values]
    );
    return rows[0];
  },

  getAll: async () => {
    const { rows } = await pool.query(
      "SELECT id, full_name, email, phone, department, role, rating, trust_score, borrow_count, is_verified, is_blocked, created_at FROM users ORDER BY created_at DESC"
    );
    return rows;
  },

  recalcTrustScore: async (userId) => {
    // trust = avg rating * 10 + min(borrow_count, 50) * 0.8 — capped at 100
    await pool.query(
      `UPDATE users SET
         rating = COALESCE((SELECT AVG(score) FROM ratings WHERE to_user = $1), 0),
         trust_score = LEAST(100,
           COALESCE((SELECT AVG(score) FROM ratings WHERE to_user = $1), 0) * 10 +
           LEAST(borrow_count, 50) * 0.8
         )
       WHERE id = $1`,
      [userId]
    );
  },
};

export default User;

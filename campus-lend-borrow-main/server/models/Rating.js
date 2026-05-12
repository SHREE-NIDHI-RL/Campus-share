import pool from "../config/db.js";

export const Rating = {
  add: async ({ from_user, to_user, borrow_id, score, feedback }) => {
    const { rows } = await pool.query(
      `INSERT INTO ratings (from_user, to_user, borrow_id, score, feedback)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (from_user, borrow_id) DO UPDATE SET score=$4, feedback=$5
       RETURNING *`,
      [from_user, to_user, borrow_id, score, feedback || null]
    );
    return rows[0];
  },

  getByUser: async (userId) => {
    const { rows } = await pool.query(
      `SELECT r.*, u.full_name AS from_name
       FROM ratings r JOIN users u ON r.from_user = u.id
       WHERE r.to_user = $1 ORDER BY r.created_at DESC`,
      [userId]
    );
    return rows;
  },
};

export const Notification = {
  create: async ({ user_id, message, type = "info" }) => {
    const { rows } = await pool.query(
      "INSERT INTO notifications (user_id, message, type) VALUES ($1,$2,$3) RETURNING *",
      [user_id, message, type]
    );
    return rows[0];
  },

  getByUser: async (userId) => {
    const { rows } = await pool.query(
      "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50",
      [userId]
    );
    return rows;
  },

  markRead: async (userId) => {
    await pool.query("UPDATE notifications SET is_read = true WHERE user_id = $1", [userId]);
  },
};

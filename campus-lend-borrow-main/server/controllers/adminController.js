import User from "../models/User.js";
import Resource from "../models/Resource.js";
import BorrowRequest from "../models/BorrowRequest.js";
import pool from "../config/db.js";

export const getUsers = async (req, res) => {
  try {
    const users = await User.getAll();
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const blockUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const updated = await User.update(userId, { is_blocked: !user.is_blocked });
    res.json({ user: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getResources = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT r.*, u.full_name AS owner_name,
              (SELECT COUNT(*) FROM borrow_requests br WHERE br.resource_id = r.id) AS borrow_count
       FROM resources r JOIN users u ON r.owner_id = u.id
       ORDER BY r.created_at DESC`
    );
    res.json({ resources: rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteResource = async (req, res) => {
  try {
    await Resource.delete(req.params.id);
    res.json({ message: "Resource deleted by admin" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const borrows = await BorrowRequest.getAll();
    res.json({ transactions: borrows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const [users, resources, activeBorrows, overdue, categories] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM users"),
      pool.query("SELECT COUNT(*) FROM resources"),
      pool.query("SELECT COUNT(*) FROM borrow_requests WHERE status IN ('active','return-due','extension-requested','extension-approved')"),
      pool.query("SELECT COUNT(*) FROM borrow_requests WHERE status IN ('active','return-due') AND due_date < CURRENT_DATE"),
      pool.query("SELECT category, COUNT(*) AS total, SUM(CASE WHEN status='available' THEN 1 ELSE 0 END) AS active FROM resources GROUP BY category"),
    ]);

    res.json({
      totalUsers: parseInt(users.rows[0].count),
      totalListings: parseInt(resources.rows[0].count),
      activeBorrows: parseInt(activeBorrows.rows[0].count),
      overdueItems: parseInt(overdue.rows[0].count),
      categoryStats: categories.rows,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

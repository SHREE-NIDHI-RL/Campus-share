import pool from "../config/db.js";

// Run every hour to mark active borrows as return-due when past due_date
export const syncOverdueStatuses = async () => {
  try {
    const { rowCount } = await pool.query(
      `UPDATE borrow_requests
       SET status = 'return-due'
       WHERE status = 'active'
         AND due_date < CURRENT_DATE`
    );

    if (rowCount > 0) {
      // Also update resource status
      await pool.query(
        `UPDATE resources SET status = 'return-due'
         WHERE id IN (
           SELECT resource_id FROM borrow_requests
           WHERE status = 'return-due'
         )`
      );
      console.log(`⏰ Marked ${rowCount} borrow(s) as return-due`);
    }
  } catch (err) {
    console.error("Status sync error:", err.message);
  }
};

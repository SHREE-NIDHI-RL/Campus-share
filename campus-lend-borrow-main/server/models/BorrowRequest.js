import pool from "../config/db.js";

let requestTypeColumnEnsured = false;

const ensureRequestTypeColumn = async () => {
  if (requestTypeColumnEnsured) return;
  await pool.query(
    `ALTER TABLE borrow_requests
     ADD COLUMN IF NOT EXISTS request_type VARCHAR(10) NOT NULL DEFAULT 'rent'
     CHECK (request_type IN ('rent', 'buy'))`
  );
  requestTypeColumnEnsured = true;
};

const BorrowRequest = {
  create: async ({ resource_id, borrower_id, owner_id, duration_days, total_rent, request_type }) => {
    try {
      const { rows } = await pool.query(
        `INSERT INTO borrow_requests (resource_id, borrower_id, owner_id, duration_days, total_rent, request_type)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
        [resource_id, borrower_id, owner_id, duration_days, total_rent || null, request_type || "rent"]
      );
      return rows[0];
    } catch (err) {
      if (err?.code === "42703" && String(err.message || "").toLowerCase().includes("request_type")) {
        await ensureRequestTypeColumn();
        const { rows } = await pool.query(
          `INSERT INTO borrow_requests (resource_id, borrower_id, owner_id, duration_days, total_rent, request_type)
           VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
          [resource_id, borrower_id, owner_id, duration_days, total_rent || null, request_type || "rent"]
        );
        return rows[0];
      }
      throw err;
    }
  },

  findById: async (id) => {
    const { rows } = await pool.query(
      `SELECT br.*, r.title AS resource_title, r.image_url,
              b.full_name AS borrower_name, o.full_name AS owner_name
       FROM borrow_requests br
       JOIN resources r ON br.resource_id = r.id
       JOIN users b ON br.borrower_id = b.id
       JOIN users o ON br.owner_id = o.id
       WHERE br.id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  getByBorrower: async (borrowerId) => {
    const { rows } = await pool.query(
      `SELECT br.*, r.title AS resource_title, r.image_url, r.category,
          o.full_name AS owner_name,
          CASE WHEN br.status IN ('approved', 'active', 'return-due', 'extension-requested', 'extension-approved')
            THEN o.email ELSE NULL END AS owner_email,
          CASE WHEN br.status IN ('approved', 'active', 'return-due', 'extension-requested', 'extension-approved')
            THEN o.phone ELSE NULL END AS owner_phone
       FROM borrow_requests br
       JOIN resources r ON br.resource_id = r.id
       JOIN users o ON br.owner_id = o.id
       WHERE br.borrower_id = $1
       ORDER BY br.created_at DESC`,
      [borrowerId]
    );
    return rows;
  },

  getByOwner: async (ownerId) => {
    const { rows } = await pool.query(
      `SELECT br.*, r.title AS resource_title, r.image_url,
              b.full_name AS borrower_name
       FROM borrow_requests br
       JOIN resources r ON br.resource_id = r.id
       JOIN users b ON br.borrower_id = b.id
       WHERE br.owner_id = $1
       ORDER BY br.created_at DESC`,
      [ownerId]
    );
    return rows;
  },

  getAll: async () => {
    const { rows } = await pool.query(
      `SELECT br.*, r.title AS resource_title,
              b.full_name AS borrower_name, o.full_name AS owner_name
       FROM borrow_requests br
       JOIN resources r ON br.resource_id = r.id
       JOIN users b ON br.borrower_id = b.id
       JOIN users o ON br.owner_id = o.id
       ORDER BY br.created_at DESC`
    );
    return rows;
  },

  update: async (id, fields) => {
    const keys = Object.keys(fields);
    const values = Object.values(fields);
    const set = keys.map((k, i) => `${k} = $${i + 2}`).join(", ");
    const { rows } = await pool.query(
      `UPDATE borrow_requests SET ${set} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return rows[0];
  },

  getOverdue: async () => {
    const { rows } = await pool.query(
      `SELECT br.*, r.title AS resource_title,
              b.full_name AS borrower_name, o.full_name AS owner_name
       FROM borrow_requests br
       JOIN resources r ON br.resource_id = r.id
       JOIN users b ON br.borrower_id = b.id
       JOIN users o ON br.owner_id = o.id
       WHERE br.status IN ('active','return-due') AND br.due_date < CURRENT_DATE`
    );
    return rows;
  },
};

export default BorrowRequest;

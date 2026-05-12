import pool from "../config/db.js";

const Resource = {
  getAll: async ({ category, type, search, status } = {}) => {
    let query = `
      SELECT r.*, u.full_name AS owner_name, u.rating AS owner_rating,
             u.is_verified AS owner_verified, u.borrow_count AS owner_borrow_count,
             u.trust_score AS owner_trust_score, u.created_at AS owner_member_since
      FROM resources r
      JOIN users u ON r.owner_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let i = 1;

    if (category && category !== "All") {
      query += ` AND r.category = $${i++}`;
      params.push(category);
    }
    if (type && type !== "All") {
      const t = type.toLowerCase();
      query += ` AND (r.listing_type = $${i} OR r.listing_type = 'both')`;
      params.push(t);
      i++;
    }
    if (search) {
      query += ` AND (r.title ILIKE $${i} OR r.description ILIKE $${i})`;
      params.push(`%${search}%`);
      i++;
    }
    if (status) {
      query += ` AND r.status = $${i++}`;
      params.push(status);
    } else {
      query += ` AND r.status != 'sold'`;
    }

    query += " ORDER BY r.created_at DESC";
    const { rows } = await pool.query(query, params);
    return rows;
  },

  getById: async (id) => {
    const { rows } = await pool.query(
      `SELECT r.*, u.full_name AS owner_name, u.rating AS owner_rating,
              u.department AS owner_department, u.is_verified AS owner_verified,
              u.borrow_count AS owner_borrow_count,
              u.trust_score AS owner_trust_score, u.created_at AS owner_member_since
       FROM resources r
       JOIN users u ON r.owner_id = u.id
       WHERE r.id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  getByOwner: async (ownerId) => {
    const { rows } = await pool.query(
      "SELECT * FROM resources WHERE owner_id = $1 ORDER BY created_at DESC",
      [ownerId]
    );
    return rows;
  },

  create: async (data) => {
    const { owner_id, title, description, category, image_url, listing_type, rent_price, buy_price, availability_days } = data;
    const { rows } = await pool.query(
      `INSERT INTO resources (owner_id, title, description, category, image_url, listing_type, rent_price, buy_price, availability_days)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [owner_id, title, description, category, image_url, listing_type, rent_price || null, buy_price || null, availability_days || null]
    );
    return rows[0];
  },

  update: async (id, fields) => {
    const keys = Object.keys(fields);
    const values = Object.values(fields);
    const set = keys.map((k, i) => `${k} = $${i + 2}`).join(", ");
    const { rows } = await pool.query(
      `UPDATE resources SET ${set} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return rows[0];
  },

  delete: async (id) => {
    await pool.query("DELETE FROM resources WHERE id = $1", [id]);
  },

  incrementViews: async (id) => {
    await pool.query("UPDATE resources SET views_count = views_count + 1 WHERE id = $1", [id]);
  },
};

export default Resource;

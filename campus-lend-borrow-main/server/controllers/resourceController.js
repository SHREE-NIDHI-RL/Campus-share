import Resource from "../models/Resource.js";
import pool from "../config/db.js";

export const getResources = async (req, res) => {
  try {
    const { category, type, search, status } = req.query;
    const resources = await Resource.getAll({ category, type, search, status });
    res.json({ resources });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getResource = async (req, res) => {
  try {
    const resource = await Resource.getById(req.params.id);
    if (!resource) return res.status(404).json({ message: "Resource not found" });
    await Resource.incrementViews(req.params.id);

    // attach active borrow info if resource is not available
    let activeBorrow = null;
    if (resource.status !== "available") {
      const { rows } = await pool.query(
        `SELECT br.*, b.full_name AS borrower_name
         FROM borrow_requests br
         JOIN users b ON br.borrower_id = b.id
         WHERE br.resource_id = $1
           AND br.status IN ('active','return-due','extension-requested','extension-approved')
         ORDER BY br.created_at DESC LIMIT 1`,
        [req.params.id]
      );
      activeBorrow = rows[0] || null;
    }

    // attach pending borrow info (resource stays "available" while pending)
    const pendingRows = await pool.query(
      `SELECT br.*, b.full_name AS borrower_name
       FROM borrow_requests br
       JOIN users b ON br.borrower_id = b.id
       WHERE br.resource_id = $1 AND br.status = 'pending'
       ORDER BY br.created_at DESC LIMIT 1`,
      [req.params.id]
    );
    const pendingBorrow = pendingRows.rows[0] || null;

    res.json({ resource, activeBorrow, pendingBorrow });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getResourceReviews = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT r.score, r.feedback, r.created_at,
              u.full_name AS reviewer_name, u.department AS reviewer_dept
       FROM ratings r
       JOIN borrow_requests br ON r.borrow_id = br.id
       JOIN users u ON r.from_user = u.id
       WHERE br.resource_id = $1
       ORDER BY r.created_at DESC`,
      [req.params.id]
    );
    const avg = rows.length ? rows.reduce((s, r) => s + r.score, 0) / rows.length : 0;
    res.json({ reviews: rows, average: parseFloat(avg.toFixed(1)), count: rows.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getRelatedResources = async (req, res) => {
  try {
    const resource = await Resource.getById(req.params.id);
    if (!resource) return res.status(404).json({ message: "Not found" });
    const { rows } = await pool.query(
      `SELECT r.id, r.title, r.category, r.image_url, r.status,
              r.rent_price, r.buy_price, r.listing_type,
              u.full_name AS owner_name
       FROM resources r
       JOIN users u ON r.owner_id = u.id
       WHERE r.category = $1 AND r.id != $2 AND r.status != 'sold'
       ORDER BY r.views_count DESC LIMIT 4`,
      [resource.category, req.params.id]
    );
    res.json({ resources: rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createResource = async (req, res) => {
  try {
    const { title, description, category, listing_type, rent_price, buy_price, availability_days } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    const resource = await Resource.create({
      owner_id: req.user.id,
      title,
      description,
      category,
      image_url,
      listing_type: listing_type || "both",
      rent_price: rent_price ? parseFloat(rent_price) : null,
      buy_price: buy_price ? parseFloat(buy_price) : null,
      availability_days: availability_days ? parseInt(availability_days) : null,
    });
    res.status(201).json({ resource });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateResource = async (req, res) => {
  try {
    const resource = await Resource.getById(req.params.id);
    if (!resource) return res.status(404).json({ message: "Resource not found" });
    if (resource.owner_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updates = { ...req.body };
    if (req.file) updates.image_url = `/uploads/${req.file.filename}`;

    const updated = await Resource.update(req.params.id, updates);
    res.json({ resource: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.getById(req.params.id);
    if (!resource) return res.status(404).json({ message: "Resource not found" });
    if (resource.owner_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }
    await Resource.delete(req.params.id);
    res.json({ message: "Resource deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyResources = async (req, res) => {
  try {
    const resources = await Resource.getByOwner(req.user.id);
    res.json({ resources });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

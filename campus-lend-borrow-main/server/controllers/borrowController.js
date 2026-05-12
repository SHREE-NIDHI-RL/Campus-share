import BorrowRequest from "../models/BorrowRequest.js";
import Resource from "../models/Resource.js";
import User from "../models/User.js";
import { Notification } from "../models/Rating.js";
import pool from "../config/db.js";

export const requestBorrow = async (req, res) => {
  try {
    const { resourceId, days, request_type } = req.body;
    const resource = await Resource.getById(resourceId);
    if (!resource) return res.status(404).json({ message: "Resource not found" });
    if (resource.status !== "available") return res.status(400).json({ message: "Resource is not available" });
    if (resource.owner_id === req.user.id) return res.status(400).json({ message: "You cannot borrow your own resource" });

    const type = request_type === 'buy' ? 'buy' : 'rent';
    const total_rent = type === 'rent' && resource.rent_price ? parseFloat(resource.rent_price) * parseInt(days) : null;

    const borrow = await BorrowRequest.create({
      resource_id: resourceId,
      borrower_id: req.user.id,
      owner_id: resource.owner_id,
      duration_days: parseInt(days) || 1,
      total_rent,
      request_type: type,
    });

    await Resource.update(resourceId, { request_count: resource.request_count + 1 });

    await Notification.create({
      user_id: resource.owner_id,
      message: `New ${type} request for "${resource.title}"`,
      type: "borrow_request",
    });

    res.status(201).json({ borrow });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const approveBorrow = async (req, res) => {
  try {
    const { borrowId } = req.body;
    const borrow = await BorrowRequest.findById(borrowId);
    if (!borrow) return res.status(404).json({ message: "Borrow request not found" });
    if (borrow.owner_id !== req.user.id) return res.status(403).json({ message: "Not authorized" });
    if (borrow.status !== "pending") return res.status(400).json({ message: "Request is not pending" });

    const isBuy = borrow.request_type === "buy";
    let updateFields;

    if (isBuy) {
      updateFields = {
        status: "active",
        due_date: null,
      };
    } else {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + borrow.duration_days);
      updateFields = {
        status: "active",
        due_date: dueDate.toISOString().split("T")[0],
      };
    }

    const updated = await BorrowRequest.update(borrowId, updateFields);

    await Resource.update(borrow.resource_id, { status: isBuy ? "sold" : "borrowed" });

    await Notification.create({
      user_id: borrow.borrower_id,
      message: `Your ${isBuy ? "purchase" : "borrow"} request for "${borrow.resource_title}" was approved`,
      type: "borrow_approved",
    });

    res.json({ borrow: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const rejectBorrow = async (req, res) => {
  try {
    const { borrowId } = req.body;
    const borrow = await BorrowRequest.findById(borrowId);
    if (!borrow) return res.status(404).json({ message: "Borrow request not found" });
    if (borrow.owner_id !== req.user.id) return res.status(403).json({ message: "Not authorized" });

    const updated = await BorrowRequest.update(borrowId, { status: "rejected" });

    await Notification.create({
      user_id: borrow.borrower_id,
      message: `Your borrow request for "${borrow.resource_title}" was rejected`,
      type: "borrow_rejected",
    });

    res.json({ borrow: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const markReturned = async (req, res) => {
  try {
    const { borrowId } = req.body;
    const borrow = await BorrowRequest.findById(borrowId);
    if (!borrow) return res.status(404).json({ message: "Borrow request not found" });
    if (borrow.borrower_id !== req.user.id && borrow.owner_id !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }
    if (borrow.request_type === "buy") {
      return res.status(400).json({ message: "Purchased items cannot be marked as returned" });
    }

    const updated = await BorrowRequest.update(borrowId, { status: "returned" });
    await Resource.update(borrow.resource_id, { status: "available" });

    // increment borrow count for borrower
    await pool.query(
      "UPDATE users SET borrow_count = borrow_count + 1 WHERE id = $1",
      [borrow.borrower_id]
    );
    await User.recalcTrustScore(borrow.borrower_id);

    await Notification.create({
      user_id: borrow.owner_id,
      message: `"${borrow.resource_title}" has been returned`,
      type: "returned",
    });

    res.json({ borrow: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const requestExtension = async (req, res) => {
  try {
    const { borrowId, days } = req.body;
    const borrow = await BorrowRequest.findById(borrowId);
    if (!borrow) return res.status(404).json({ message: "Borrow request not found" });
    if (borrow.borrower_id !== req.user.id) return res.status(403).json({ message: "Not authorized" });
    if (borrow.request_type === "buy") {
      return res.status(400).json({ message: "Extensions are only available for rent requests" });
    }

    const updated = await BorrowRequest.update(borrowId, {
      extension_requested: true,
      status: "extension-requested",
      duration_days: parseInt(days) || borrow.duration_days,
    });

    await Resource.update(borrow.resource_id, { status: "extension-requested" });

    await Notification.create({
      user_id: borrow.owner_id,
      message: `Extension requested for "${borrow.resource_title}"`,
      type: "extension_request",
    });

    res.json({ borrow: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const approveExtension = async (req, res) => {
  try {
    const { borrowId } = req.body;
    const borrow = await BorrowRequest.findById(borrowId);
    if (!borrow) return res.status(404).json({ message: "Borrow request not found" });
    if (borrow.owner_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }
    if (borrow.request_type === "buy") {
      return res.status(400).json({ message: "Extensions are only available for rent requests" });
    }

    const base = borrow.due_date ? new Date(borrow.due_date) : new Date();
    base.setDate(base.getDate() + borrow.duration_days);

    const updated = await BorrowRequest.update(borrowId, {
      extension_approved: true,
      status: "extension-approved",
      extended_due_date: base.toISOString().split("T")[0],
    });

    await Resource.update(borrow.resource_id, { status: "extension-approved" });

    await Notification.create({
      user_id: borrow.borrower_id,
      message: `Extension approved for "${borrow.resource_title}"`,
      type: "extension_approved",
    });

    res.json({ borrow: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyBorrows = async (req, res) => {
  try {
    const borrows = await BorrowRequest.getByBorrower(req.user.id);
    res.json({ borrows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyLentItems = async (req, res) => {
  try {
    const borrows = await BorrowRequest.getByOwner(req.user.id);
    res.json({ borrows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

import User from "../models/User.js";
import { Rating } from "../models/Rating.js";
import BorrowRequest from "../models/BorrowRequest.js";
import Resource from "../models/Resource.js";

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const ratings = await Rating.getByUser(req.user.id);
    const borrows = await BorrowRequest.getByBorrower(req.user.id);
    const lent = await BorrowRequest.getByOwner(req.user.id);
    const listings = await Resource.getByOwner(req.user.id);

    res.json({ user, ratings, borrows, lent, listings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { full_name, department, phone } = req.body;
    const updated = await User.update(req.user.id, { full_name, department, phone });
    res.json({ user: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

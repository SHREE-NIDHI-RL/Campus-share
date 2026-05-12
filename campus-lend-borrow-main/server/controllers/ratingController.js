import { Rating } from "../models/Rating.js";
import User from "../models/User.js";

export const addRating = async (req, res) => {
  try {
    const { to_user, borrow_id, score, feedback } = req.body;
    if (to_user === req.user.id) return res.status(400).json({ message: "Cannot rate yourself" });

    const rating = await Rating.add({ from_user: req.user.id, to_user, borrow_id, score, feedback });
    await User.recalcTrustScore(to_user);

    res.status(201).json({ rating });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUserRatings = async (req, res) => {
  try {
    const ratings = await Rating.getByUser(req.params.id);
    res.json({ ratings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

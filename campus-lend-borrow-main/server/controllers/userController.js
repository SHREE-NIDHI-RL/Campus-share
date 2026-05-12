import User from "../models/User.js";
import { Rating } from "../models/Rating.js";
import Resource from "../models/Resource.js";

export const getPublicUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const [ratings, listings] = await Promise.all([
      Rating.getByUser(req.params.id),
      Resource.getByOwner(req.params.id),
    ]);

    res.json({
      user,
      ratings,
      stats: {
        listingsCount: listings.length,
        ratingsCount: ratings.length,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


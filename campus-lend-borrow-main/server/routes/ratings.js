import { Router } from "express";
import { addRating, getUserRatings } from "../controllers/ratingController.js";
import auth from "../middleware/auth.js";

const router = Router();

router.post("/add", auth, addRating);
router.get("/user/:id", getUserRatings);

export default router;

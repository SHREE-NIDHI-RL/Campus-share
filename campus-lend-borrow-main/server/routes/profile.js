import { Router } from "express";
import { getProfile, updateProfile } from "../controllers/profileController.js";
import auth from "../middleware/auth.js";

const router = Router();

router.use(auth);
router.get("/", getProfile);
router.put("/", updateProfile);

export default router;

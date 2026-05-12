import { Router } from "express";
import {
  getUsers, blockUser, getResources,
  deleteResource, getTransactions, getAnalytics,
} from "../controllers/adminController.js";
import auth from "../middleware/auth.js";
import adminOnly from "../middleware/adminOnly.js";

const router = Router();

router.use(auth, adminOnly);

router.get("/users", getUsers);
router.post("/block-user", blockUser);
router.get("/resources", getResources);
router.delete("/resources/:id", deleteResource);
router.get("/transactions", getTransactions);
router.get("/analytics", getAnalytics);

export default router;

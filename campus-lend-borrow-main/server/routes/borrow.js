import { Router } from "express";
import {
  requestBorrow, approveBorrow, rejectBorrow,
  markReturned, requestExtension, approveExtension,
  getMyBorrows, getMyLentItems,
} from "../controllers/borrowController.js";
import auth from "../middleware/auth.js";

const router = Router();

router.use(auth);

router.post("/request", requestBorrow);
router.post("/approve", approveBorrow);
router.post("/reject", rejectBorrow);
router.post("/return", markReturned);
router.post("/extension-request", requestExtension);
router.post("/extension-approve", approveExtension);
router.get("/me", getMyBorrows);
router.get("/lent", getMyLentItems);

export default router;

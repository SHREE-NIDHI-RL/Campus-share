import { Router } from "express";
import {
  getResources, getResource, createResource,
  updateResource, deleteResource, getMyResources,
  getResourceReviews, getRelatedResources,
} from "../controllers/resourceController.js";
import auth from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = Router();

router.get("/", getResources);
router.get("/mine", auth, getMyResources);
router.get("/:id", getResource);
router.get("/:id/reviews", getResourceReviews);
router.get("/:id/related", getRelatedResources);
router.post("/", auth, upload.single("image"), createResource);
router.put("/:id", auth, upload.single("image"), updateResource);
router.delete("/:id", auth, deleteResource);

export default router;

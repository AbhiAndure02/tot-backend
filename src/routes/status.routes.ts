import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
    createStatus,
    getMyStatuses,
    getFeed,
    updateVisibility,
    deleteStatus,
} from "../controllers/status.controller.js";

const router = Router();

// All routes are JWT-protected
router.use(protect);

// POST /api/statuses         - create a new status
// GET  /api/statuses/mine    - get own statuses
// GET  /api/statuses/feed    - get statuses visible to me (from contacts)
router.post("/", createStatus);
router.get("/mine", getMyStatuses);
router.get("/feed", getFeed);

// PUT  /api/statuses/:statusId/visibility - update who can see a status
// DEL  /api/statuses/:statusId            - delete a status
router.put("/:statusId/visibility", updateVisibility);
router.delete("/:statusId", deleteStatus);

export default router;
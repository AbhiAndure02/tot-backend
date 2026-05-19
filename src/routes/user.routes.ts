import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
    getMe,
    updateMe,
    syncContacts,
    getMyFriends,
    updateFriendMeta,
    removeFriend,
    blockUser,
    unblockUser,
    searchUsers,
} from "../controllers/user.controller.js";

const router = Router();

router.use(protect);

// ── Profile ───────────────────────────────────────────────────────────────────
// GET  /api/users/me
// PUT  /api/users/me
router.get("/me", getMe);
router.put("/me", updateMe);

// ── Search ────────────────────────────────────────────────────────────────────
// GET  /api/users/search?q=
router.get("/search", searchUsers);

// ── Phone Contact Sync ────────────────────────────────────────────────────────
// POST /api/users/sync-contacts  { numbers: ["9999999999", ...] }
// Matches phone numbers against DB → saves as Friends → returns matched users
router.post("/sync-contacts", syncContacts);

// ── Friends ───────────────────────────────────────────────────────────────────
// GET    /api/users/friends                  - list my friends
// PUT    /api/users/friends/:friendId        - update nickname / mute / pin
// DELETE /api/users/friends/:friendId        - remove friend
router.get("/friends", getMyFriends);
router.put("/friends/:friendId", updateFriendMeta);
router.delete("/friends/:friendId", removeFriend);

// ── Block / Unblock ───────────────────────────────────────────────────────────
// POST /api/users/block/:targetId
// POST /api/users/unblock/:targetId
router.post("/block/:targetId", blockUser);
router.post("/unblock/:targetId", unblockUser);

export default router;
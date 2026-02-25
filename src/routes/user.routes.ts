import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
    getMe,
    updateMe,
    getContacts,
    addContact,
    removeContact,
    blockUser,
    unblockUser,
    searchUsers,
} from "../controllers/user.controller.js";

const router = Router();

// All routes are JWT-protected
router.use(protect);

// GET  /api/users/me        - get own profile
// PUT  /api/users/me        - update own profile
router.get("/me", getMe);
router.put("/me", updateMe);

// GET  /api/users/search?q= - search users
router.get("/search", searchUsers);

// GET  /api/users/contacts        - list contacts
// POST /api/users/contacts/:contactId  - add contact
// DEL  /api/users/contacts/:contactId  - remove contact
router.get("/contacts", getContacts);
router.post("/contacts/:contactId", addContact);
router.delete("/contacts/:contactId", removeContact);

// POST /api/users/block/:targetId   - block user
// POST /api/users/unblock/:targetId - unblock user
router.post("/block/:targetId", blockUser);
router.post("/unblock/:targetId", unblockUser);

export default router;
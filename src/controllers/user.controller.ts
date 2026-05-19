import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import * as userService from "../services/user.service.js";

interface TargetReq extends AuthRequest { params: { friendId: string } }
interface BlockReq extends AuthRequest { params: { targetId: string } }

// ── Profile ───────────────────────────────────────────────────────────────────

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        res.json(await userService.getProfile(req.userId!));
    } catch (err: any) {
        res.status(404).json({ message: err.message });
    }
};

export const updateMe = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        res.json(await userService.updateProfile(req.userId!, req.body));
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

// ── Phone Contact Sync ────────────────────────────────────────────────────────

export const syncContacts = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { numbers } = req.body;
        if (!Array.isArray(numbers)) {
            res.status(400).json({ message: "numbers must be an array" });
            return;
        }
        res.json(await userService.syncPhoneContacts(req.userId!, numbers));
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

// ── Friends ───────────────────────────────────────────────────────────────────

export const getMyFriends = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        res.json(await userService.getMyFriends(req.userId!));
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const updateFriendMeta = async (req: TargetReq, res: Response): Promise<void> => {
    try {
        res.json(await userService.updateFriendMeta(req.userId!, req.params.friendId, req.body));
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const removeFriend = async (req: TargetReq, res: Response): Promise<void> => {
    try {
        res.json(await userService.removeFriend(req.userId!, req.params.friendId));
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

// ── Block / Unblock ───────────────────────────────────────────────────────────

export const blockUser = async (req: BlockReq, res: Response): Promise<void> => {
    try {
        res.json(await userService.blockUser(req.userId!, req.params.targetId));
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const unblockUser = async (req: BlockReq, res: Response): Promise<void> => {
    try {
        res.json(await userService.unblockUser(req.userId!, req.params.targetId));
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

// ── Search ────────────────────────────────────────────────────────────────────

export const searchUsers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const q = String(req.query.q || "").trim();
        if (!q) { res.json([]); return; }
        res.json(await userService.searchUsers(q, req.userId!));
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};
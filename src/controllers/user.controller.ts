import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import * as userService from "../services/user.service";

// Merge AuthRequest with typed route params
interface ContactReq extends AuthRequest { params: { contactId: string } }
interface TargetReq extends AuthRequest { params: { targetId: string } }

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await userService.getProfile(req.userId!);
        res.json(user);
    } catch (err: any) {
        res.status(404).json({ message: err.message });
    }
};

export const updateMe = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await userService.updateProfile(req.userId!, req.body);
        res.json(user);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const getContacts = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const contacts = await userService.getContacts(req.userId!);
        res.json(contacts);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const addContact = async (req: ContactReq, res: Response): Promise<void> => {
    try {
        const result = await userService.addContact(req.userId!, req.params.contactId);
        res.json(result);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const removeContact = async (req: ContactReq, res: Response): Promise<void> => {
    try {
        const result = await userService.removeContact(req.userId!, req.params.contactId);
        res.json(result);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const blockUser = async (req: TargetReq, res: Response): Promise<void> => {
    try {
        const result = await userService.blockUser(req.userId!, req.params.targetId);
        res.json(result);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const unblockUser = async (req: TargetReq, res: Response): Promise<void> => {
    try {
        const result = await userService.unblockUser(req.userId!, req.params.targetId);
        res.json(result);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const searchUsers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const q = String(req.query.q || "").trim();
        if (!q) { res.json([]); return; }
        const users = await userService.searchUsers(q, req.userId!);
        res.json(users);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};
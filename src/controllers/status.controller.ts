import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import * as statusService from "../services/status.service";

interface StatusReq extends AuthRequest { params: { statusId: string } }

export const createStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { visibleToContacts = true, ...data } = req.body;
        const status = await statusService.createStatus(req.userId!, data, visibleToContacts);
        res.status(201).json(status);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const getMyStatuses = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const statuses = await statusService.getMyStatuses(req.userId!);
        res.json(statuses);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const getFeed = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const statuses = await statusService.getVisibleStatuses(req.userId!);
        res.json(statuses);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const updateVisibility = async (req: StatusReq, res: Response): Promise<void> => {
    try {
        const { allowedUserIds } = req.body;
        const result = await statusService.updateStatusVisibility(
            req.params.statusId,
            req.userId!,
            allowedUserIds
        );
        res.json(result);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const deleteStatus = async (req: StatusReq, res: Response): Promise<void> => {
    try {
        const result = await statusService.deleteStatus(req.params.statusId, req.userId!);
        res.json(result);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};
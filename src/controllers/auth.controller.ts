import { Request, Response } from "express";
import { registerUser, loginUser } from "../services/auth.service";

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await registerUser(req.body);
        res.status(201).json(result);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { number, password } = req.body;
        if (!number || !password) {
            res.status(400).json({ message: "Number and password are required" });
            return;
        }
        const result = await loginUser(number, password);
        res.json(result);
    } catch (err: any) {
        res.status(401).json({ message: err.message });
    }
};
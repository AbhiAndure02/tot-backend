import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
    userId?: string;
    userName?: string;
    userNumber?: string;
    userProfile?: string;
    userLocation?: string;
    isAdmin?: boolean;
}

interface DecodedToken {
    id: string;
    name: string;
    number: string;
    profile: string;
    location?: string;
    isAdmin: boolean;
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ message: "Unauthorized: No token provided" });
        return;
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
        req.userId = decoded.id;
        req.userName = decoded.name;
        req.userNumber = decoded.number;
        req.userProfile = decoded.profile;
        req.userLocation = decoded.location;
        req.isAdmin = decoded.isAdmin;
        next();
    } catch {
        res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
    }
};

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.isAdmin) {
        res.status(403).json({ message: "Forbidden: Admins only" });
        return;
    }
    next();
};
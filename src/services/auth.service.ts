import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";

interface TokenPayload {
    id: string;
    name: string;
    number: string;
    profile: string;
    location?: string;
    isAdmin: boolean;
}

const generateToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, process.env.JWT_SECRET as string, {
        expiresIn: process.env.JWT_EXPIRES_IN || "180d",
    } as jwt.SignOptions);
};

export const registerUser = async (data: {
    name: string;
    number: string;
    password: string;
    location?: string;
}) => {
    const exists = await User.findOne({ number: data.number });
    if (exists) throw new Error("Phone number already registered");

    const hashed = await bcrypt.hash(data.password, 10);
    const user = await User.create({ ...data, password: hashed });

    const token = generateToken({
        id: String(user._id),
        name: user.name,
        number: user.number,
        profile: user.profile,
        location: user.location ?? undefined,
        isAdmin: user.isAdmin,
    });

    return {
        _id: user._id,
        name: user.name,
        number: user.number,
        profile: user.profile,
        location: user.location ?? undefined,
        isAdmin: user.isAdmin,
        token,
    };
};

export const loginUser = async (number: string, password: string) => {
    const user = await User.findOne({ number });
    if (!user) throw new Error("Invalid credentials");

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error("Invalid credentials");

    const token = generateToken({
        id: String(user._id),
        name: user.name,
        number: user.number,
        profile: user.profile,
        location: user.location ?? undefined,
        isAdmin: user.isAdmin,
    });

    return {
        _id: user._id,
        name: user.name,
        number: user.number,
        profile: user.profile,
        location: user.location ?? undefined,
        isAdmin: user.isAdmin,
        token,
    };
};
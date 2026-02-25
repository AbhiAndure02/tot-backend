import mongoose from "mongoose";
import User from "../models/User.js";

export const getProfile = async (userId: string) => {
    const user = await User.findById(userId).select("-password");
    if (!user) throw new Error("User not found");
    return user;
};

export const updateProfile = async (userId: string, updates: Partial<{ name: string; location: string; profile: string }>) => {
    const user = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true }).select("-password");
    if (!user) throw new Error("User not found");
    return user;
};

export const addContact = async (userId: string, contactId: string) => {
    if (userId === contactId) throw new Error("Cannot add yourself");
    const contact = await User.findById(contactId);
    if (!contact) throw new Error("Contact not found");

    await User.findByIdAndUpdate(userId, { $addToSet: { contacts: contactId } });
    return { message: "Contact added" };
};

export const removeContact = async (userId: string, contactId: string) => {
    await User.findByIdAndUpdate(userId, { $pull: { contacts: contactId } });
    return { message: "Contact removed" };
};

export const getContacts = async (userId: string) => {
    const user = await User.findById(userId).populate("contacts", "-password -blocked -contacts");
    if (!user) throw new Error("User not found");
    return user.contacts;
};

export const blockUser = async (userId: string, targetId: string) => {
    if (userId === targetId) throw new Error("Cannot block yourself");
    await User.findByIdAndUpdate(userId, { $addToSet: { blocked: targetId }, $pull: { contacts: targetId } });
    return { message: "User blocked" };
};

export const unblockUser = async (userId: string, targetId: string) => {
    await User.findByIdAndUpdate(userId, { $pull: { blocked: targetId } });
    return { message: "User unblocked" };
};

export const searchUsers = async (query: string, currentUserId: string) => {
    const users = await User.find({
        $or: [{ name: { $regex: query, $options: "i" } }, { number: { $regex: query } }],
        _id: { $ne: currentUserId },
    }).select("name number profile location");
    return users;
};
import mongoose from "mongoose";
import User from "../models/User.js";
import Friend from "../models/Friend.js";
import {
    deleteCacheByPattern,
    deleteCacheKeys,
    getCachedJson,
    setCachedJson,
} from "../config/redis.js";

const profileCacheKey = (userId: string) => `user:${userId}:profile`;
const friendsCacheKey = (userId: string) => `user:${userId}:friends`;

// ── Profile ───────────────────────────────────────────────────────────────────

export const getProfile = async (userId: string) => {
    const cacheKey = profileCacheKey(userId);
    const cached = await getCachedJson(cacheKey);
    if (cached) return cached;

    const user = await User.findById(userId).select("-password").lean();
    if (!user) throw new Error("User not found");
    await setCachedJson(cacheKey, user, 300);
    return user;
};

export const updateProfile = async (
    userId: string,
    updates: Partial<{ name: string; location: string; profile: string }>
) => {
    const allowedUpdates = {
        ...(updates.name !== undefined ? { name: updates.name } : {}),
        ...(updates.location !== undefined ? { location: updates.location } : {}),
        ...(updates.profile !== undefined ? { profile: updates.profile } : {}),
    };

    const user = await User.findByIdAndUpdate(userId, allowedUpdates, {
        new: true,
        runValidators: true,
    }).select("-password").lean();
    if (!user) throw new Error("User not found");
    await deleteCacheKeys(profileCacheKey(userId));
    return user;
};

// ── Phone Contact Sync ────────────────────────────────────────────────────────

export const syncPhoneContacts = async (
    currentUserId: string,
    numbers: string[]
) => {
    if (!Array.isArray(numbers) || numbers.length === 0) return [];

    const normalize = (n: string) => n.replace(/\D/g, "").slice(-10);
    const normalized = numbers.map(normalize).filter(Boolean);

    const currentUser = await User.findById(currentUserId).select("blocked");
    const blockedIds = (currentUser?.blocked ?? []).map(String);

    const matchedUsers = await User.find({
        _id: { $ne: currentUserId, $nin: blockedIds },
        $expr: {
            $in: [
                {
                    $substr: [
                        "$number",
                        { $subtract: [{ $strLenCP: "$number" }, 10] },
                        10,
                    ],
                },
                normalized,
            ],
        },
    }).select("_id name number profile location");

    if (matchedUsers.length === 0) return [];

    // Inline ops — avoids mongodb vs mongoose AnyBulkWriteOperation type conflict
    const ownerObjectId = new mongoose.Types.ObjectId(currentUserId);

    await Friend.bulkWrite(
        matchedUsers.map((u) => ({
            updateOne: {
                filter: { owner: ownerObjectId, friend: u._id },
                update: { $setOnInsert: { owner: ownerObjectId, friend: u._id } },
                upsert: true,
            },
        }))
    );

    await deleteCacheKeys(friendsCacheKey(currentUserId));
    return matchedUsers;
};

// ── Friends ───────────────────────────────────────────────────────────────────

export const getMyFriends = async (userId: string) => {
    const cacheKey = friendsCacheKey(userId);
    const cached = await getCachedJson(cacheKey);
    if (cached) return cached;

    const friends = await Friend.find({ owner: userId })
        .populate("friend", "name number profile location")
        .sort({ isPinned: -1, createdAt: -1 })
        .lean();

    await setCachedJson(cacheKey, friends, 120);
    return friends;
};

export const updateFriendMeta = async (
    ownerId: string,
    friendId: string,
    updates: Partial<{ nickname: string; isMuted: boolean; isPinned: boolean }>
) => {
    const doc = await Friend.findOneAndUpdate(
        { owner: ownerId, friend: friendId },
        updates,
        { new: true }
    ).populate("friend", "name number profile location");
    if (!doc) throw new Error("Friend not found");
    await deleteCacheKeys(friendsCacheKey(ownerId));
    return doc;
};

export const removeFriend = async (ownerId: string, friendId: string) => {
    await Friend.findOneAndDelete({ owner: ownerId, friend: friendId });
    await deleteCacheKeys(friendsCacheKey(ownerId));
    return { message: "Friend removed" };
};

// ── Block / Unblock ───────────────────────────────────────────────────────────

export const blockUser = async (userId: string, targetId: string) => {
    if (userId === targetId) throw new Error("Cannot block yourself");
    await User.findByIdAndUpdate(userId, { $addToSet: { blocked: targetId } });
    await Friend.findOneAndDelete({ owner: userId, friend: targetId });
    await deleteCacheKeys(profileCacheKey(userId), friendsCacheKey(userId));
    await deleteCacheByPattern("statuses:feed:*");
    return { message: "User blocked" };
};

export const unblockUser = async (userId: string, targetId: string) => {
    await User.findByIdAndUpdate(userId, { $pull: { blocked: targetId } });
    await deleteCacheKeys(profileCacheKey(userId));
    return { message: "User unblocked" };
};

// ── Search ────────────────────────────────────────────────────────────────────

export const searchUsers = async (query: string, currentUserId: string) => {
    const users = await User.find({
        $or: [
            { name: { $regex: query, $options: "i" } },
            { number: { $regex: query } },
        ],
        _id: { $ne: currentUserId },
    }).select("name number profile location");
    return users;
};

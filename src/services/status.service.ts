import Status from "../models/Status.js";
import StatusVisibility from "../models/StatusVisibility.js";
import Friend from "../models/Friend.js";
import {
    deleteCacheByPattern,
    deleteCacheKeys,
    getCachedJson,
    setCachedJson,
} from "../config/redis.js";

const myStatusesCacheKey = (userId: string) => `statuses:user:${userId}:mine`;
const feedCacheKey = (viewerId: string) => `statuses:feed:${viewerId}`;

// ── Create ────────────────────────────────────────────────────────────────────

export const createStatus = async (
    userId: string,
    data: {
        startFrom?: string;
        transportType?: string;
        endTo?: string;
        date?: Date;
        time?: string;
        additionalInfo?: string;
    },
    visibleToFriends: boolean = true
) => {
    const status = await Status.create({ userId, ...data });

    if (visibleToFriends) {
        // Fetch all friends of this user from Friend collection
        const friends = await Friend.find({ owner: userId }).select("friend");

        if (friends.length > 0) {
            const visibilityDocs = friends.map((f) => ({
                statusId: status._id,
                allowedUserId: f.friend,
            }));
            await StatusVisibility.insertMany(visibilityDocs, { ordered: false });
        }
    }

    await deleteCacheKeys(myStatusesCacheKey(userId));
    await deleteCacheByPattern("statuses:feed:*");
    return status;
};

// ── Read ──────────────────────────────────────────────────────────────────────

export const getMyStatuses = async (userId: string) => {
    const cacheKey = myStatusesCacheKey(userId);
    const cached = await getCachedJson(cacheKey);
    if (cached) return cached;

    const statuses = await Status.find({ userId }).sort({ createdAt: -1 }).lean();
    await setCachedJson(cacheKey, statuses, 60);
    return statuses;
};

export const getVisibleStatuses = async (viewerId: string) => {
    const cacheKey = feedCacheKey(viewerId);
    const cached = await getCachedJson(cacheKey);
    if (cached) return cached;

    const visibilities = await StatusVisibility.find({ allowedUserId: viewerId }).select("statusId");
    const statusIds = visibilities.map((v) => v.statusId);

    const statuses = await Status.find({ _id: { $in: statusIds } })
        .populate("userId", "name number profile")
        .sort({ createdAt: -1 })
        .lean();

    await setCachedJson(cacheKey, statuses, 30);
    return statuses;
};

// ── Visibility ────────────────────────────────────────────────────────────────

export const updateStatusVisibility = async (
    statusId: string,
    ownerId: string,
    allowedUserIds: string[]
) => {
    const status = await Status.findOne({ _id: statusId, userId: ownerId });
    if (!status) throw new Error("Status not found or not yours");

    await StatusVisibility.deleteMany({ statusId });

    if (allowedUserIds.length > 0) {
        const docs = allowedUserIds.map((uid) => ({ statusId, allowedUserId: uid }));
        await StatusVisibility.insertMany(docs, { ordered: false });
    }

    await deleteCacheKeys(myStatusesCacheKey(ownerId));
    await deleteCacheByPattern("statuses:feed:*");
    return { message: "Visibility updated" };
};

// ── Delete ────────────────────────────────────────────────────────────────────

export const deleteStatus = async (statusId: string, userId: string) => {
    const status = await Status.findOneAndDelete({ _id: statusId, userId });
    if (!status) throw new Error("Status not found or not yours");
    await StatusVisibility.deleteMany({ statusId });
    await deleteCacheKeys(myStatusesCacheKey(userId));
    await deleteCacheByPattern("statuses:feed:*");
    return { message: "Status deleted" };
};

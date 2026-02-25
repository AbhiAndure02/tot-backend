import mongoose from "mongoose";
import Status from "../models/Status.js";
import StatusVisibility from "../models/StatusVisibility.js";
import User from "../models/User.js";

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
    visibleToContacts: boolean = true
) => {
    const status = await Status.create({ userId, ...data });

    if (visibleToContacts) {
        // Allow all contacts to view this status by default
        const user = await User.findById(userId).select("contacts");
        if (user && user.contacts.length > 0) {
            const visibilityDocs = user.contacts.map((contactId) => ({
                statusId: status._id,
                allowedUserId: contactId,
            }));
            await StatusVisibility.insertMany(visibilityDocs, { ordered: false });
        }
    }

    return status;
};

export const getMyStatuses = async (userId: string) => {
    return Status.find({ userId }).sort({ createdAt: -1 });
};

export const getVisibleStatuses = async (viewerId: string) => {
    // Find all statuses this viewer is allowed to see
    const visibilities = await StatusVisibility.find({ allowedUserId: viewerId }).select("statusId");
    const statusIds = visibilities.map((v) => v.statusId);

    return Status.find({ _id: { $in: statusIds } })
        .populate("userId", "name number profile")
        .sort({ createdAt: -1 });
};

export const updateStatusVisibility = async (
    statusId: string,
    ownerId: string,
    allowedUserIds: string[]
) => {
    const status = await Status.findOne({ _id: statusId, userId: ownerId });
    if (!status) throw new Error("Status not found or not yours");

    // Replace visibility list
    await StatusVisibility.deleteMany({ statusId });
    if (allowedUserIds.length > 0) {
        const docs = allowedUserIds.map((uid) => ({ statusId, allowedUserId: uid }));
        await StatusVisibility.insertMany(docs, { ordered: false });
    }
    return { message: "Visibility updated" };
};

export const deleteStatus = async (statusId: string, userId: string) => {
    const status = await Status.findOneAndDelete({ _id: statusId, userId });
    if (!status) throw new Error("Status not found or not yours");
    await StatusVisibility.deleteMany({ statusId });
    return { message: "Status deleted" };
};
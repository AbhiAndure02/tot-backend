import cron from "node-cron";
import Status from "../models/Status.js";
import StatusVisibility from "../models/StatusVisibility.js";

const deleteExpiredStatuses = async () => {
    try {
        const now = new Date();

        const expiredStatuses = await Status.find({ date: { $lt: now } }).select("_id");

        if (expiredStatuses.length === 0) return;

        const expiredIds = expiredStatuses.map((s) => s._id);

        await StatusVisibility.deleteMany({ statusId: { $in: expiredIds } });

        const result = await Status.deleteMany({ _id: { $in: expiredIds } });

        console.log(`[StatusCleanup] Deleted ${result.deletedCount} expired status(es)`);
    } catch (err) {
        console.error("[StatusCleanup] Error during cleanup:", err);
    }
};

export const scheduleStatusCleanup = () => {
    deleteExpiredStatuses();
    cron.schedule("0 * * * *", deleteExpiredStatuses, { timezone: "UTC" });
};
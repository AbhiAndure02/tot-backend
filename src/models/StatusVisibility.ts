import mongoose from "mongoose";

const statusVisibilitySchema = new mongoose.Schema(
    {
        statusId: { type: mongoose.Schema.Types.ObjectId, ref: "Status", required: true, index: true },
        allowedUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    },
    { timestamps: true }
);

statusVisibilitySchema.index({ statusId: 1, allowedUserId: 1 }, { unique: true });

const StatusVisibility = mongoose.model("StatusVisibility", statusVisibilitySchema);
export default StatusVisibility;
import mongoose from "mongoose";

const statusSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        startFrom: String,
        transportType: String,
        endTo: String,
        date: Date,
        time: String,
        additionalInfo: String,
    },
    { timestamps: true }
);

statusSchema.index({ userId: 1, createdAt: -1 });

const Status = mongoose.model("Status", statusSchema);
export default Status;
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        location: { type: String, trim: true },
        number: { type: String, required: true, unique: true, index: true },
        password: { type: String, required: true },
        profile: { type: String, default: "" },
        isAdmin: { type: Boolean, default: false },
        blocked: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
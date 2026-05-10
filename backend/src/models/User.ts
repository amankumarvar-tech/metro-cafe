import { Schema, model, Document } from "mongoose";
import bcrypt from "bcryptjs";

export type UserRole = "super_admin" | "vendor_owner" | "vendor_staff" | "customer";

export interface IUser extends Document {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: UserRole;
    avatar?: string;
    vendor?: Schema.Types.ObjectId;
    permissions: string[];
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    isActive: boolean;
    lastLogin?: Date;
    refreshTokens: string[];
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    twoFactorEnabled: boolean;
    twoFactorSecret?: string;
    comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, unique: true, lowercase: true, sparse: true },
        phone: { type: String, unique: true, sparse: true },
        password: { type: String, select: false },
        role: {
            type: String,
            enum: ["super_admin", "vendor_owner", "vendor_staff", "customer"],
            default: "customer",
        },
        avatar: String,
        vendor: { type: Schema.Types.ObjectId, ref: "Vendor" },
        permissions: [String],
        isEmailVerified: { type: Boolean, default: false },
        isPhoneVerified: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        lastLogin: Date,
        refreshTokens: [String],
        passwordResetToken: String,
        passwordResetExpires: Date,
        twoFactorEnabled: { type: Boolean, default: false },
        twoFactorSecret: { type: String, select: false },
    },
    { timestamps: true }
);

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    if (this.password) {
        this.password = await bcrypt.hash(this.password, 12);
    }
});

userSchema.methods.comparePassword = async function (candidate: string) {
    return bcrypt.compare(candidate, this.password);
};

userSchema.index({ role: 1, isActive: 1 });

export const User = model<IUser>("User", userSchema);

import { Schema, model, Document } from "mongoose";

export interface IVendor extends Document {
    name: string;
    slug: string;
    owner: Schema.Types.ObjectId;
    stationLocation: {
        metroLine: string;
        stationName: string;
        booth: string;
    };
    logo: string;
    coverImage: string;
    operatingHours: {
        day: string;
        open: string;
        close: string;
    }[];
    isActive: boolean;
    subscriptionPlan: "starter" | "pro" | "enterprise";
    subscriptionExpiry: Date;
    bankDetails: {
        accountName: string;
        accountNumber: string;
        bankName: string;
    };
    settings: {
        acceptingOrders: boolean;
        averagePrepTime: number;
        currency: string;
    };
    rating: { total: number; count: number };
}

const vendorSchema = new Schema<IVendor>(
    {
        name: { type: String, required: true, trim: true },
        slug: { type: String, unique: true, lowercase: true },
        owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
        stationLocation: {
            metroLine: { type: String, required: true },
            stationName: { type: String, required: true },
            booth: { type: String },
        },
        logo: String,
        coverImage: String,
        operatingHours: [{ day: String, open: String, close: String }],
        isActive: { type: Boolean, default: false },
        subscriptionPlan: {
            type: String,
            enum: ["starter", "pro", "enterprise"],
            default: "starter",
        },
        subscriptionExpiry: Date,
        settings: {
            acceptingOrders: { type: Boolean, default: true },
            averagePrepTime: { type: Number, default: 10 },
            currency: { type: String, default: "USD" },
        },
        rating: { total: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
    },
    { timestamps: true }
);

vendorSchema.index({ "stationLocation.metroLine": 1, "stationLocation.stationName": 1 });
// slug wali line gone ✓

export const Vendor = model<IVendor>("Vendor", vendorSchema);

import * as dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { setDefaultResultOrder } from "dns";

setDefaultResultOrder("ipv4first");

export const connectDB = async (): Promise<void> => {
    try {
        const uri = process.env.MONGODB_URI;
        console.log("URI:", uri ? "✅ Found" : "❌ Undefined");

        const conn = await mongoose.connect(uri as string, {
            serverSelectionTimeoutMS: 15000,
            family: 4,
        });
        console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("❌ MongoDB connection failed:", error);
        process.exit(1);
    }
};
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || "";

async function seed() {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");

    const UserSchema = new mongoose.Schema({
        name: String,
        email: { type: String, unique: true },
        password: String,
        role: { type: String, default: "customer" },
    });

    const User =
        mongoose.models.User || mongoose.model("User", UserSchema);

    const existing = await User.findOne({ email: "admin@metro.com" });
    if (existing) {
        console.log("⚠️  Super admin already exists!");
        process.exit(0);
    }

    const hash = await bcrypt.hash("admin123", 10);
    await User.create({
        name: "Super Admin",
        email: "admin@metro.com",
        password: hash,
        role: "super_admin",
    });

    console.log("✅ Super admin created!");
    console.log("   Email:    admin@metro.com");
    console.log("   Password: admin123");
    process.exit(0);
}

seed().catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
});
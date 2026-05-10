import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { Vendor } from "../models/Vendor";

const generateTokens = (userId: string, role: string, vendorId?: string) => {
    const accessToken = jwt.sign(
        { userId, role, vendorId },
        process.env.JWT_SECRET!,
        { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
        { userId },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: "7d" }
    );
    return { accessToken, refreshToken };
};

// REGISTER
export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, phone, password, role } = req.body;
        const existing = await User.findOne({ $or: [{ email }, { phone }] });
        if (existing) return res.status(400).json({ message: "User already exists" });

        const user = await User.create({ name, email, phone, password, role: role || "customer" });
        const { accessToken, refreshToken } = generateTokens(user._id.toString(), user.role);

        res.status(201).json({
            success: true,
            data: {
                user: { _id: user._id, name: user.name, email: user.email, role: user.role },
                accessToken,
                refreshToken,
            },
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// LOGIN
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select("+password");
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // ← Vendor automatically dhundo
        let vendorId: string | undefined;
        if (user.role === "vendor_owner" || user.role === "vendor_staff") {
            const vendor = await Vendor.findOne({ owner: user._id as any });
            vendorId = vendor?._id.toString();
        }

        const { accessToken, refreshToken } = generateTokens(
            user._id.toString(),
            user.role,
            vendorId
        );

        user.lastLogin = new Date();
        await user.save();

        res.json({
            success: true,
            data: {
                user: { _id: user._id, name: user.name, email: user.email, role: user.role },
                accessToken,
                refreshToken,
            },
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// GET ME
export const getMe = async (req: any, res: Response) => {
    try {
        const user = await User.findById(req.user.userId);
        res.json({ success: true, data: { user } });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
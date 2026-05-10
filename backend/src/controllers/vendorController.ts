import { Request, Response } from "express";
import { Vendor } from "../models/Vendor";
import { AuthRequest } from "../middleware/auth";

// CREATE VENDOR
export const createVendor = async (req: AuthRequest, res: Response) => {
    try {
        const slug = req.body.name.toLowerCase().replace(/\s+/g, "-");

        const vendor = await Vendor.create({
            ...req.body,
            slug,
            owner: req.user?.userId,
        });

        res.status(201).json({ success: true, data: { vendor } });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// GET ALL VENDORS
export const getVendors = async (req: Request, res: Response) => {
    try {
        const { metroLine, stationName, page = 1, limit = 10 } = req.query;

        const filter: any = { isActive: true };
        if (metroLine) filter["stationLocation.metroLine"] = metroLine;
        if (stationName) filter["stationLocation.stationName"] = stationName;

        const vendors = await Vendor.find(filter)
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .populate("owner", "name email");

        const total = await Vendor.countDocuments(filter);

        res.json({
            success: true,
            data: { vendors, total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// GET VENDOR BY SLUG
export const getVendorBySlug = async (req: Request, res: Response) => {
    try {
        const vendor = await Vendor.findOne({ slug: req.params.slug })
            .populate("owner", "name email");

        if (!vendor) return res.status(404).json({ message: "Vendor not found" });

        res.json({ success: true, data: { vendor } });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE VENDOR
export const updateVendor = async (req: AuthRequest, res: Response) => {
    try {
        const vendor = await Vendor.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!vendor) return res.status(404).json({ message: "Vendor not found" });

        res.json({ success: true, data: { vendor } });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// TOGGLE ACCEPTING ORDERS
export const toggleAcceptingOrders = async (req: AuthRequest, res: Response) => {
    try {
        const vendor = await Vendor.findById(req.params.id);
        if (!vendor) return res.status(404).json({ message: "Vendor not found" });

        vendor.settings.acceptingOrders = !vendor.settings.acceptingOrders;
        await vendor.save();

        res.json({
            success: true,
            data: { acceptingOrders: vendor.settings.acceptingOrders },
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
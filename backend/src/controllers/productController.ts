import { Request, Response } from "express";
import { Product } from "../models/Product";
import { AuthRequest } from "../middleware/auth";

// CREATE PRODUCT
export const createProduct = async (req: AuthRequest, res: Response) => {
    try {
        const product = await Product.create({
            ...req.body,
            vendor: req.body.vendorId,
        });
        res.status(201).json({ success: true, data: { product } });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// GET VENDOR PRODUCTS
export const getVendorProducts = async (req: Request, res: Response) => {
    try {
        const { vendorId } = req.params;
        const { category } = req.query;

        const filter: any = { vendor: vendorId, isAvailable: true };
        if (category) filter.category = category;

        const products = await Product.find(filter).sort({ sortOrder: 1, createdAt: -1 });

        // Group by category
        const grouped = products.reduce((acc: any, product) => {
            const cat = product.category;
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(product);
            return acc;
        }, {});

        res.json({ success: true, data: { products, grouped } });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE PRODUCT
export const updateProduct = async (req: AuthRequest, res: Response) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json({ success: true, data: { product } });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE PRODUCT
export const deleteProduct = async (req: AuthRequest, res: Response) => {
    try {
        await Product.findByIdAndUpdate(req.params.id, { isAvailable: false });
        res.json({ success: true, message: "Product removed" });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
import { Request, Response } from "express";
import { Order } from "../models/Order";
import { Product } from "../models/Product";
import { Vendor } from "../models/Vendor";
import mongoose from "mongoose";
import { emitNewOrder } from "../socket";

export const createOrder = async (req: Request, res: Response) => {
    try {
        const { vendorId, items, customer, payment, specialInstructions } = req.body;

        const vendor = await Vendor.findById(vendorId);
        if (!vendor || !vendor.isActive || !vendor.settings.acceptingOrders) {
            return res.status(400).json({ success: false, message: "Vendor is not accepting orders" });
        }

        let subtotal = 0;
        const enrichedItems = await Promise.all(
            items.map(async (item: any) => {
                const product = await Product.findById(item.productId);
                if (!product || !product.isAvailable) {
                    throw new Error(`Product ${item.productId} unavailable`);
                }
                const variantTotal = item.selectedVariants?.reduce((s: number, v: any) => s + (v.priceModifier || 0), 0) ?? 0;
                const addonTotal = item.selectedAddons?.reduce((s: number, a: any) => s + (a.price * (a.quantity || 1)), 0) ?? 0;
                const itemTotal = (product.price + variantTotal + addonTotal) * item.quantity;
                subtotal += itemTotal;
                return {
                    product: product._id,
                    productName: product.name,
                    productImage: product.images?.[0] || "",
                    quantity: item.quantity,
                    basePrice: product.price,
                    selectedVariants: item.selectedVariants || [],
                    selectedAddons: item.selectedAddons || [],
                    itemTotal,
                    notes: item.notes || "",
                };
            })
        );

        const taxRate = 0.08;
        const tax = +(subtotal * taxRate).toFixed(2);
        const platformFeeRate = 0.05;
        const platformFee = +(subtotal * platformFeeRate).toFixed(2);
        const total = +(subtotal + tax).toFixed(2);

        const order = await Order.create({
            vendor: vendorId,
            customer,
            items: enrichedItems,
            pricing: { subtotal, tax, taxRate, discount: 0, total, platformFee, vendorEarning: total - platformFee },
            payment: { method: payment?.method || "cash", status: "pending" },
            specialInstructions,
            estimatedReadyTime: new Date(Date.now() + vendor.settings.averagePrepTime * 60000),
            metaData: { platform: "web", ipAddress: req.ip },
        });

        // ← Real-time emit
        emitNewOrder(vendorId, order);

        res.status(201).json({ success: true, data: { order } });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getVendorOrders = async (req: Request, res: Response) => {
    try {
        const { vendorId } = req.params;
        const orders = await Order.find({ vendor: vendorId as any })
            .populate("vendor")
            .sort({ createdAt: -1 });
        res.json({ success: true, data: { orders } });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getOrderByNumber = async (req: Request, res: Response) => {
    try {
        const { orderNumber } = req.params;
        const order = await Order.findOne({ orderNumber }).populate("vendor");
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });
        res.json({ success: true, data: { order } });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
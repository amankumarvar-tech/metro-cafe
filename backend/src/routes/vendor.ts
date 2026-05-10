import { Router } from "express";
import { protect, restrictTo } from "../middleware/auth";
import {
    createVendor,
    getVendors,
    getVendorBySlug,
    updateVendor,
    toggleAcceptingOrders,
} from "../controllers/vendorController";



const router = Router();

// Public routes
router.get("/", getVendors);
router.get("/:slug", getVendorBySlug);

// Protected routes
router.post("/", protect, restrictTo("vendor_owner", "super_admin"), createVendor);
router.patch("/:id", protect, restrictTo("vendor_owner", "super_admin"), updateVendor);
router.patch("/:id/toggle-orders", protect, restrictTo("vendor_owner"), toggleAcceptingOrders);

export default router;
import { Router } from "express";
import { protect } from "../middleware/auth";
import {
    createOrder,
    getVendorOrders,
    getOrderByNumber,
} from "../controllers/orderController";

const router = Router();

router.post("/", createOrder);
router.get("/vendor/:vendorId", protect, getVendorOrders);
router.get("/track/:orderNumber", getOrderByNumber);

export default router;
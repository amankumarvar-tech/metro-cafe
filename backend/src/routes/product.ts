import { Router } from "express";
import { protect, restrictTo } from "../middleware/auth";
import {
    createProduct,
    getVendorProducts,
    updateProduct,
    deleteProduct,
} from "../controllers/productController";

const router = Router();

router.get("/vendor/:vendorId", getVendorProducts);
router.post("/", protect, restrictTo("vendor_owner", "vendor_staff"), createProduct);
router.patch("/:id", protect, restrictTo("vendor_owner", "vendor_staff"), updateProduct);
router.delete("/:id", protect, restrictTo("vendor_owner", "vendor_staff"), deleteProduct);

export default router;
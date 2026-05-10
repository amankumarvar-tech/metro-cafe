import { Schema, model, Document } from "mongoose";

export interface IOrderItem {
    product: Schema.Types.ObjectId;
    productName: string;
    productImage: string;
    quantity: number;
    basePrice: number;
    selectedVariants: { name: string; option: string; priceModifier: number }[];
    selectedAddons: { name: string; price: number; quantity: number }[];
    itemTotal: number;
    notes?: string;
}

export type OrderStatus =
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "picked_up"
    | "cancelled"
    | "refunded";

export interface IOrder extends Document {
    orderNumber: string;
    vendor: Schema.Types.ObjectId;
    customer: {
        userId?: Schema.Types.ObjectId;
        name: string;
        phone: string;
        email?: string;
    };
    items: IOrderItem[];
    pricing: {
        subtotal: number;
        tax: number;
        taxRate: number;
        discount: number;
        couponCode?: string;
        total: number;
        platformFee: number;
        vendorEarning: number;
    };
    payment: {
        method: "cash" | "card" | "upi" | "wallet";
        status: "pending" | "paid" | "failed" | "refunded";
        transactionId?: string;
        paidAt?: Date;
    };
    status: OrderStatus;
    statusHistory: { status: OrderStatus; timestamp: Date; note?: string }[];
    pickupToken: string;
    estimatedReadyTime?: Date;
    actualReadyTime?: Date;
    pickedUpAt?: Date;
    cancelReason?: string;
    specialInstructions?: string;
    metaData: {
        platform: "web" | "mobile" | "kiosk";
        deviceType?: string;
        ipAddress?: string;
    };
}

const orderSchema = new Schema<IOrder>(
    {
        orderNumber: { type: String, unique: true, sparse: true },
        vendor: { type: Schema.Types.ObjectId, ref: "Vendor", required: true, index: true },
        customer: {
            userId: { type: Schema.Types.ObjectId, ref: "User" },
            name: { type: String, required: true },
            phone: { type: String, required: true },
            email: String,
        },
        items: [
            {
                product: { type: Schema.Types.ObjectId, ref: "Product" },
                productName: String,
                productImage: String,
                quantity: { type: Number, min: 1 },
                basePrice: Number,
                selectedVariants: [{ name: String, option: String, priceModifier: Number }],
                selectedAddons: [{ name: String, price: Number, quantity: Number }],
                itemTotal: Number,
                notes: String,
            },
        ],
        pricing: {
            subtotal: Number,
            tax: Number,
            taxRate: Number,
            discount: { type: Number, default: 0 },
            couponCode: String,
            total: Number,
            platformFee: Number,
            vendorEarning: Number,
        },
        payment: {
            method: { type: String, enum: ["cash", "card", "upi", "wallet"] },
            status: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
            transactionId: String,
            paidAt: Date,
        },
        status: {
            type: String,
            enum: ["pending", "confirmed", "preparing", "ready", "picked_up", "cancelled", "refunded"],
            default: "pending",
            index: true,
        },
        statusHistory: [{ status: String, timestamp: Date, note: String }],
        pickupToken: String,
        estimatedReadyTime: Date,
        actualReadyTime: Date,
        pickedUpAt: Date,
        cancelReason: String,
        specialInstructions: String,
        metaData: { platform: String, deviceType: String, ipAddress: String },
    },
    { timestamps: true }
);

orderSchema.index({ vendor: 1, status: 1, createdAt: -1 });
orderSchema.index({ "customer.phone": 1 });

// Auto-generate order number
orderSchema.pre("save", async function () {
    if (this.isNew) {
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const count = await Order.countDocuments();
        this.orderNumber = `MCF-${date}-${String(count + 1).padStart(4, "0")}`;
        this.pickupToken = String(Math.floor(1000 + Math.random() * 9000));
    }
});

export const Order = model<IOrder>("Order", orderSchema);

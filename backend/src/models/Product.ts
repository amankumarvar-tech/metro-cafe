import { Schema, model, Document } from "mongoose";

export interface IProduct extends Document {
    vendor: Schema.Types.ObjectId;
    name: string;
    description: string;
    category: string;
    subcategory?: string;
    price: number;
    discountedPrice?: number;
    images: string[];
    tags: string[];
    dietary: {
        isVeg: boolean;
        isVegan: boolean;
        isGlutenFree: boolean;
        isHalal: boolean;
    };
    nutritionInfo?: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };
    variants: {
        name: string;
        options: { label: string; priceModifier: number }[];
    }[];
    addons: {
        name: string;
        price: number;
        maxQuantity: number;
    }[];
    stockStatus: "in_stock" | "out_of_stock" | "limited";
    stockCount?: number;
    preparationTime: number;
    isAvailable: boolean;
    sortOrder: number;
}

const productSchema = new Schema<IProduct>(
    {
        vendor: { type: Schema.Types.ObjectId, ref: "Vendor", required: true, index: true },
        name: { type: String, required: true },
        description: String,
        category: { type: String, required: true, index: true },
        subcategory: String,
        price: { type: Number, required: true, min: 0 },
        discountedPrice: Number,
        images: [String],
        tags: [String],
        dietary: {
            isVeg: { type: Boolean, default: false },
            isVegan: { type: Boolean, default: false },
            isGlutenFree: { type: Boolean, default: false },
            isHalal: { type: Boolean, default: false },
        },
        nutritionInfo: {
            calories: Number,
            protein: Number,
            carbs: Number,
            fat: Number,
        },
        variants: [
            {
                name: String,
                options: [{ label: String, priceModifier: Number }],
            },
        ],
        addons: [{ name: String, price: Number, maxQuantity: Number }],
        stockStatus: {
            type: String,
            enum: ["in_stock", "out_of_stock", "limited"],
            default: "in_stock",
        },
        stockCount: Number,
        preparationTime: { type: Number, default: 10 },
        isAvailable: { type: Boolean, default: true },
        sortOrder: { type: Number, default: 0 },
    },
    { timestamps: true }
);

productSchema.index({ vendor: 1, category: 1, isAvailable: 1 });
productSchema.index({ name: "text", description: "text", tags: "text" });

export const Product = model<IProduct>("Product", productSchema);

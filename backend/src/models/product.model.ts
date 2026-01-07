import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
    name: string;
    slug: string;
    brand: string;
    category: string;

    mrp: number;
    discountPercent?: number;

    description: string;

    variants: {
        size: string;
        stock: number;
    }[];

    color?: string[];
    fit?: string;
    gender?: string;

    images: string[];
    thumbnail: string[];

    isFeatured: boolean;

    tags?: string[];

    adminId: mongoose.Types.ObjectId;
}

const ProductSchema = new Schema<IProduct>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },

        brand: {
            type: String,
            required: true,
        },

        category: {
            type: String,
            required: true,
            index: true,
        },

        mrp: {
            type: Number,
            required: true,
        },

        discountPercent: {
            type: Number,
            min: 0,
            max: 100,
        },

        description: {
            type: String,
            required: true,
        },

        variants: [
            {
                size: {
                    type: String,
                    required: true,
                },
                stock: {
                    type: Number,
                    required: true,
                    min: 0,
                },
            },
        ],

        color: [String],
        fit: String,

        gender: {
            type: String,
            enum: ["men", "women", "unisex"],
        },

        images: {
            type: [String],
            required: true,
        },

        thumbnail: {
            type: [String],
            required: true,
        },

        isFeatured: {
            type: Boolean,
            default: false,
        },

        tags: [String],

        adminId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

export const Product = mongoose.model<IProduct>("Product", ProductSchema);
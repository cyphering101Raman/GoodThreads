import { Request, Response } from "express";
import { Product } from "../models/product.model";

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        role: string;
    };
}


export const createProduct = async (req: AuthRequest, res: Response) => {
    try {
        const product = await Product.create({
            ...req.body,
            adminId: req.user!.userId,
        });

        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: "Product creation failed" });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const product = await Product.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        );

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json(product);
    } catch (error) {
        res.status(500).json({ message: "Product update failed" });
    }
};


export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Product deletion failed" });
    }
};


export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const products = await Product.find({ })
            .sort({ createdAt: -1 });

        res.json(products);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch products" });
    }
};


export const getProductBySlug = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;

        const product = await Product.findOne({ slug });

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json(product);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch product" });
    }
};


export const toggleFeaturedProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        product.isFeatured = !product.isFeatured;
        await product.save();

        res.json({
            message: "Product featured status updated",
            isFeatured: product.isFeatured,
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to toggle featured status" });
    }
};

export const updateVariantStock = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { size, stock } = req.body;

        const product = await Product.findOneAndUpdate(
            { _id: id, "variants.size": size },
            { $set: { "variants.$.stock": stock } },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({ message: "Variant not found" });
        }

        res.json(product);
    } catch (error) {
        res.status(500).json({ message: "Failed to update stock" });
    }
};

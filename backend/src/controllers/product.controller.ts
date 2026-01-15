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
        const files = req.files as {
            images?: Express.Multer.File[];
            thumbnail?: Express.Multer.File[];
        };

        if (!files.images?.length || !files.thumbnail?.length) {
            return res.status(400).json({ message: "Images and thumbnail required" });
        }

        const imageUrls = files.images.map((file) => file.path);
        const thumbnailUrls = files.thumbnail.map(file => file.path);

        const product = await Product.create({
            ...req.body,
            images: imageUrls,
            thumbnail: thumbnailUrls,
            adminId: req.user!.userId
        });

        res.status(201).json(product);
    } catch (err) {
        console.error(err);
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

        res.status(200).json(product);
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

        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Product deletion failed" });
    }
};


export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const page = Math.max(Number(req.query.page) || 1, 1);
        const pageLimit = 16;
        const productSkip = (page - 1) * pageLimit;
        const totalCount: number = await Product.countDocuments({});
        const totalPages = Math.ceil(totalCount / pageLimit);

        const products = await Product.find({})
            .skip(productSkip)
            .limit(pageLimit)
            .sort({ createdAt: -1 });

        res.status(200).json({
            products,
            pagination: {
                totalCount,
                totalPages,
                currentPage: page,
                pageLimit,
            }
        });
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

        res.status(200).json(product);
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

        res.status(200).json({
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

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: "Failed to update stock" });
    }
};

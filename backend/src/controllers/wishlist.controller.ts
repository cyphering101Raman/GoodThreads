import { Request, Response } from "express";
import { Wishlist } from "../models/wishlist.model";
import { sendResponse } from "../utils/ApiResponse";

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        role: string;
    };
}

/**
 * GET /wishlist
 * Fetch user's wishlist
 */
export const getWishlist = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;

        const wishlist = await Wishlist.findOne({ userId })
            .populate("products");

        return sendResponse(res, { data: wishlist });
    } catch (error) {
        return sendResponse(res, {
            statusCode: 500,
            success: false,
            message: "Failed to fetch wishlist",
        });
    }
};

/**
 * POST /wishlist/add
 * Add product to wishlist
 */
export const addToWishlist = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { productId } = req.body;

        let wishlist = await Wishlist.findOne({ userId });

        if (!wishlist) {
            wishlist = await Wishlist.create({
                userId,
                products: [],
            });
        }

        const alreadyExists = wishlist.products.some(
            (id) => id.toString() === productId
        );

        if (!alreadyExists) {
            wishlist.products.push(productId);
            await wishlist.save();
        }

        return sendResponse(res, {
            message: "Added to wishlist",
            data: wishlist,
        });
    } catch (error) {
        return sendResponse(res, {
            statusCode: 500,
            success: false,
            message: "Failed to add to wishlist",
        });
    }
};

/**
 * DELETE /wishlist/item
 * Remove product from wishlist
 */
export const removeFromWishlist = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { productId } = req.body;

        const wishlist = await Wishlist.findOne({ userId });

        if (!wishlist) {
            return sendResponse(res, {
                statusCode: 404,
                success: false,
                message: "Wishlist not found",
            });
        }

        wishlist.products = wishlist.products.filter(
            (id) => id.toString() !== productId
        );

        await wishlist.save();

        return sendResponse(res, {
            message: "Delete successful",
            data: wishlist,
        });
    } catch (error) {
        return sendResponse(res, {
            statusCode: 500,
            success: false,
            message: "Failed to remove from wishlist",
        });
    }
};

/**
 * DELETE /wishlist/clear
 * Clear wishlist
 */
export const clearWishlist = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;

        const wishlist = await Wishlist.findOne({ userId });

        if (!wishlist) {
            return sendResponse(res, {
                statusCode: 404,
                success: false,
                message: "Wishlist not found",
            });
        }

        wishlist.products = [];
        await wishlist.save();

        return sendResponse(res, {
            message: "Delete successful",
            data: wishlist,
        });
    } catch (error) {
        return sendResponse(res, {
            statusCode: 500,
            success: false,
            message: "Failed to clear wishlist",
        });
    }
};

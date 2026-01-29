import { Request, Response } from "express";
import { Product } from "../models/product.model";
import { Cart } from "../models/cart.model"
import { User } from "../models/user.model";
import { sendResponse } from "../utils/ApiResponse";

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        role: string;
    };
}

/**
 * GET /cart
*/
export const getCart = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;

        const cart = await Cart.findOne({ user: userId })
            .populate("items.product");

        return sendResponse(res, {
            data: cart,
            message: "Cart fetched successfully",
        });

    } catch (error) {
        return sendResponse(res, {
            statusCode: 500,
            success: false,
            message: "Failed to fetch cart",
        });
    }
};

/**
 * POST /cart/add
 * Add item to cart OR increase quantity
 */
export const addItemToCart = async (req: AuthRequest, res: Response) => {
    try {
        const { productId, size, quantity } = req.body;
        const userId = req.user?.userId;

        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            cart = await Cart.create({
                user: userId,
                items: [],
            });
        }

        const itemIndex = cart.items.findIndex(
            (item) => item.product.toString() === productId && item.size === size
        );

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({
                product: productId,
                size,
                quantity,
            })
        }

        await cart.save();

        return sendResponse(res, {
            data: cart,
            message: "Item added to cart successfully",
        });


    } catch (error) {
        return sendResponse(res, {
            statusCode: 500,
            success: false,
            message: "Failed to add item to cart",
        });
    }
};

/**
 * PATCH /cart/item
 * Update quantity of a cart item
 */
export const updateCartItem = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { productId, size, quantity } = req.body;

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return sendResponse(res, {
                statusCode: 404,
                success: false,
                message: "Cart not found",
            });
        }

        const itemIndex = cart.items.findIndex(
            (item) => item.product.toString() === productId && item.size === size
        );

        if (itemIndex === -1) {
            return sendResponse(res, {
                statusCode: 404,
                success: false,
                message: "Item not found in cart",
            });
        }

        if (quantity === 0) {
            cart.items.splice(itemIndex, 1);
        } else {
            cart.items[itemIndex].quantity = quantity;
        }

        await cart.save();

        return sendResponse(res, {
            data: cart,
            message: "Cart item updated successfully",
        });

    } catch (error) {
        return sendResponse(res, {
            statusCode: 500,
            success: false,
            message: "Failed to add item to cart",
        });
    }
};

/**
 * DELETE /cart/item
 * Remove a single item from cart
 */
export const removeCartItem = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { productId, size } = req.body;

        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return sendResponse(res, {
                statusCode: 404,
                success: false,
                message: "Cart not found",
            });
        }

        cart.items = cart.items.filter(
            (item) => !(
                item.product.toString() === productId &&
                item.size === size
            )
        );

        await cart.save();

        return sendResponse(res, {
            data: cart,
            message: "Item removed from cart successfully",
        });

    } catch (error) {
        return sendResponse(res, {
            statusCode: 500,
            success: false,
            message: "Failed to remove item from cart",
        });
    }
};

/**
 * DELETE /cart/clear
 * Remove all items from cart
 */
export const clearCart = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;

        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return sendResponse(res, {
                statusCode: 404,
                success: false,
                message: "Cart is not avaiable.",
            });
        }

        cart.items = [];
        await cart.save();

        return sendResponse(res, {
            data: cart,
            message: "Cart cleared successfully",
        });

    } catch (error) {
        return sendResponse(res, {
            statusCode: 500,
            success: false,
            message: "Failed to delete cart",
        });
    }
};

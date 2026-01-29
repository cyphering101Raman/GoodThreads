import { Response } from "express";
import Order from "../models/order.model";
import { Cart } from "../models/cart.model";
import { Product } from "../models/product.model";
import { sendResponse } from "../utils/ApiResponse";
import { AuthRequest } from "../types/AuthRequest.dto";

const getFinalPrice = (mrp: number, discountPercent?: number) => {
    if (!discountPercent || discountPercent <= 0) return mrp;
    return Math.round(mrp - (mrp * discountPercent) / 100);
};

/**
 * POST /orders
 * Create order from cart
 */
export const createOrder = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;

        const cart = await Cart.findOne({ user: userId });

        if (!cart || cart.items.length === 0) {
            return sendResponse(res, {
                statusCode: 400,
                success: false,
                message: "Cart is empty",
            });
        }

        const productIds = cart.items.map(item => item.product);

        const products = await Product.find({
            _id: { $in: productIds },
        });

        const productMap = new Map(
            products.map(p => [p._id.toString(), p])
        );

        const orderItems = cart.items.map(item => {
            const product = productMap.get(item.product.toString());

            if (!product) {
                throw new Error("Product not found");
            }

            const priceAtPurchase = getFinalPrice(
                product.mrp,
                product.discountPercent
            );

            return {
                product: item.product,
                size: item.size,
                quantity: item.quantity,
                priceAtPurchase,
            };
        });

        const totalAmount = orderItems.reduce(
            (sum, item) => sum + item.quantity * item.priceAtPurchase,
            0
        );

        const order = await Order.create({
            user: userId,
            items: orderItems,
            totalAmount,
        });

        // clear cart after order creation
        cart.items = [];
        await cart.save();

        return sendResponse(res, {
            data: order,
            message: "Order created successfully",
        });
    } catch (error) {
        return sendResponse(res, {
            statusCode: 500,
            success: false,
            message: "Failed to create order",
        });
    }
};


/**
 * GET /orders
 * Get logged-in user's orders
 */
export const getMyOrders = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;

        const orders = await Order.find({ user: userId })
            .sort({ createdAt: -1 });

        return sendResponse(res, {
            data: orders,
            message: "Orders fetched successfully",
        });
    } catch (error) {
        return sendResponse(res, {
            statusCode: 500,
            success: false,
            message: "Failed to fetch orders",
        });
    }
};

/**
 * GET /orders/:orderId
 * Get order details
 */
export const getOrderById = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { orderId } = req.params;

        const order = await Order.findOne({
            _id: orderId,
            user: userId,
        }).populate("items.product");

        if (!order) {
            return sendResponse(res, {
                statusCode: 404,
                success: false,
                message: "Order not found",
            });
        }

        return sendResponse(res, {
            data: order,
            message: "Order fetched successfully",
        });
    } catch (error) {
        return sendResponse(res, {
            statusCode: 500,
            success: false,
            message: "Failed to fetch order",
        });
    }
};

/**
 * PATCH /orders/payment
 * Update payment status (webhook / callback)
 */
export const updatePaymentStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { orderId, paymentStatus, paymentId } = req.body;

        const order = await Order.findById(orderId);

        if (!order) {
            return sendResponse(res, {
                statusCode: 404,
                success: false,
                message: "Order not found",
            });
        }

        order.paymentStatus = paymentStatus;
        if (paymentId) order.paymentId = paymentId;

        await order.save();

        return sendResponse(res, {
            data: order,
            message: "Payment status updated successfully"
        });
    } catch (error) {
        return sendResponse(res, {
            statusCode: 500,
            success: false,
            message: "Failed to update payment status",
        });
    }
};

/**
 * PATCH /orders/status
 * Update order status (admin)
 */
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { orderId, orderStatus } = req.body;

        const order = await Order.findById(orderId);

        if (!order) {
            return sendResponse(res, {
                statusCode: 404,
                success: false,
                message: "Order not found",
            });
        }

        order.orderStatus = orderStatus;
        await order.save();

        return sendResponse(res, {
            data: order,
            message: "Order status updated successfully",
        });
    } catch (error) {
        return sendResponse(res, {
            statusCode: 500,
            success: false,
            message: "Failed to update order status",
        });
    }
};

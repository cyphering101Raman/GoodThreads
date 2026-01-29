import mongoose, { Schema, Document } from "mongoose";

export interface IOrderItem {
    product: mongoose.Types.ObjectId;
    size: string;
    quantity: number;
    priceAtPurchase: number;
}

export interface IOrder extends Document {
    user: mongoose.Types.ObjectId;
    items: IOrderItem[];

    totalAmount: number;

    paymentStatus: "PENDING" | "PAID" | "FAILED";
    orderStatus: "PLACED" | "SHIPPED" | "DELIVERED" | "CANCELLED";

    paymentId?: string;
}

const OrderItemSchema = new Schema<IOrderItem>(
    {
        product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        size: {
            type: String,
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
        priceAtPurchase: {
            type: Number,
            required: true,
        },
    },
    { _id: false }
);

const OrderSchema = new Schema<IOrder>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        items: {
            type: [OrderItemSchema],
            required: true,
        },

        totalAmount: {
            type: Number,
            required: true,
        },

        paymentStatus: {
            type: String,
            enum: ["PENDING", "PAID", "FAILED"],
            default: "PENDING",
        },

        orderStatus: {
            type: String,
            enum: ["PLACED", "SHIPPED", "DELIVERED", "CANCELLED"],
            default: "PLACED",
        },

        paymentId: {
            type: String,
        },
    },
    { timestamps: true }
);

const Order = mongoose.model<IOrder>("Order", OrderSchema);
export default Order;

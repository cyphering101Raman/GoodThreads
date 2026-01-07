import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
    name: string,
    email: string;
    password: string;
    role: "USER" | "ADMIN";

    // optional profile fields
    phone?: string;
    gender?: "male" | "female" | "other";
    dateOfBirth?: Date;
    profilePic?: string;
    address?: IAddress;

    isPasswordValid(candidatePassword: string): Promise<boolean>;

    createdAt: Date;
    updatedAt: Date;
}

interface IAddress {
    line1: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
}

const AddressSchema = new Schema<IAddress>(
    {
        line1: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
        country: { type: String, required: true },
    },
    { _id: false }
);

const UserSchema = new mongoose.Schema<IUser>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        role: {
            type: String,
            enum: ["USER", "ADMIN"],
            default: "USER",
        },

        // optional profile fields
        phone: {
            type: String,
        },
        gender: {
            type: String,
            enum: ["male", "female", "other"],
        },
        dateOfBirth: {
            type: Date,
        },
        profilePic: {
            type: String,
        },
        address: {
            type: AddressSchema,
        },
    },
    {
        timestamps: true,
    }
);

UserSchema.pre<IUser>("save", async function () {
    if (!this.isModified("password")) return;

    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
});

UserSchema.methods.isPasswordValid = async function ( candidatePassword: string ): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser>("User", UserSchema);

export { User };
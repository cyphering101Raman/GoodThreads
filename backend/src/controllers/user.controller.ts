import { Request, Response, CookieOptions} from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";

import { generateOtp, hashOtp, compareOtp } from "../utils/otp";
import { sendVerificationEmail } from "../utils/email";
import { redis } from "../config/redis";

interface UserProfileUpdates {
    name?: string;
    phone?: string;
    gender?: string;
    dateOfBirth?: string;
    profilePic?: string;
    address?: {
        line1: string;
        city: string;
        state: string;
        pincode: string;
        country: string;
    };
    isEmailVerified?: boolean;
}


export interface AuthRequest extends Request {
    user?: {
        userId: string;
        role: string;
    };
}

export const cookieOptions: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const registerUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

        if (!name || !email || !password || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }

        const user = await User.create({
            name,
            email,
            password,
        });

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET!,
            { expiresIn: "7d" }
        );

        return res.status(201)
            .cookie("token", token, cookieOptions)
            .json({
                message: "User registered successfully",
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isValid = await user.isPasswordValid(password);
        if (!isValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET!,
            { expiresIn: "7d" }
        );

        return res.status(200)
            .cookie("token", token, cookieOptions)
            .json({
                message: "Login successful",
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const logoutUser = (req: Request, res: Response) => {
    try {
        res.clearCookie("token", {
            ...cookieOptions,
            maxAge: 0,
        });

        return res.status(200).json({
            message: "Logout successful",
        });
    } catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getCurrentUser = async(req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;

        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ user });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;

        const { name, phone, gender, dateOfBirth, profilePic, address } = req.body as Partial<UserProfileUpdates>;

        const updates: Partial<UserProfileUpdates> = {};

        if (name !== undefined) updates.name = name;
        if (phone !== undefined) updates.phone = phone;
        if (gender !== undefined) updates.gender = gender;
        if (dateOfBirth !== undefined) updates.dateOfBirth = dateOfBirth;
        if (profilePic !== undefined) updates.profilePic = profilePic;
        if (address !== undefined) updates.address = address;

        const user = await User.findByIdAndUpdate(
            userId,
            updates,
            { new: true, runValidators: true }
        ).select("-password");

        return res.status(200).json({
            message: "Profile updated",
            user,
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const changePassword = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isValid = await user.isPasswordValid(currentPassword);
        if (!isValid) {
            return res.status(401).json({ message: "Current password incorrect" });
        }

        user.password = newPassword;
        await user.save();

        return res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const deleteAccount = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;

        await User.findByIdAndDelete(userId);

        res.clearCookie("token", cookieOptions);

        return res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};


// ADMIN-ONLY
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find().select("-password");

        return res.status(200).json({ users });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const sendEmailVerification = async ( req: AuthRequest, res: Response ) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({ message: "Email already verified" });
        }

        const otp = generateOtp();
        const otpHash = await hashOtp(otp);

        await redis.set(
            `email_verify:${userId}`,
            { otpHash },
            { ex: 600 }
        );

        await sendVerificationEmail(user.email, otp);

        return res.status(200).json({
            message: "Verification email sent",
        });
    } catch (error) {
        console.error("Send verification error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const verifyEmailOtp = async ( req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { otp } = req.body;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!otp) {
            return res.status(400).json({ message: "OTP is required" });
        }

        const data = await redis.get<{ otpHash: string }>(
            `email_verify:${userId}`
        );

        if (!data) {
            return res.status(400).json({ message: "OTP expired or invalid" });
        }

        const isValid = await compareOtp(otp, data.otpHash);
        if (!isValid) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        await User.findByIdAndUpdate(userId, {
            isEmailVerified: true,
        });

        await redis.del(`email_verify:${userId}`);

        return res.status(200).json({
            message: "Email verified successfully",
        });
    } catch (error) {
        console.error("Verify email OTP error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
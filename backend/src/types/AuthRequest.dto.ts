import { Request } from "express";

export interface AuthRequest<P = any, B = any>
    extends Request<P, any, B> {
    user?: {
        userId: string;
        role: string;
    };
}

import { Response } from "express";

interface ApiResponseOptions {
    statusCode?: number;
    message?: string;
    data?: any;
    success?: boolean;
}

export const sendResponse = (res: Response, {
        statusCode = 200,
        success = true,
        message = "Success",
        data = null,
    }: ApiResponseOptions ) => {
    return res.status(statusCode).json({
        success,
        message,
        data,
    });
};

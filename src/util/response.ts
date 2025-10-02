import { type Response } from "express";

export function sendResponse(res: Response, data: any, message = "OK") {
    res.status(200).json({
        status: "success",
        message,
        data
    });
} 

export function sendError(res: Response, message = "error", error: any, statusCode = 500) {
    res.status(statusCode).json({
        status: "error",
        message,
        error
    });
}
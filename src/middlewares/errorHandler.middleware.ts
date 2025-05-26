import { AxiosError } from 'axios';
import { UploadApiErrorResponse } from 'cloudinary';
import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { JsonWebTokenError } from 'jsonwebtoken';
import { MulterError } from 'multer';
import { ZodError } from 'zod';
import { MongooseError } from 'mongoose';
import {
    ApiError,
    BAD_REQUEST,
    INTERNAL_SERVER_ERROR,
    PAYLOAD_TOO_LARGE,
    SERVER,
    UNAUTHORIZED,
} from '../utils';

type ErrorType =
    | ApiError
    | ZodError
    | Error
    | JsonWebTokenError
    | UploadApiErrorResponse
    | MulterError
    | AxiosError
    | MongooseError;


    export const errorHandler: ErrorRequestHandler = (
    error: ErrorType,
    _req: Request,
    res: Response,
    _next: NextFunction,
): void => {
    if (error instanceof ApiError) {
        res.status(error.status).json({ 
            success: false,
            message: error.message 
        });
        return;
    }

    if (error instanceof ZodError) {
        res.status(BAD_REQUEST).json({
            message: 'Validation failed',
            success: false,
            errors: error.issues.map((issue) => ({
                field: issue.path.join('.'),
                message: issue.message,
            })),
        });
        return;
    }

    if (error instanceof JsonWebTokenError) {
        res.status(UNAUTHORIZED).json({ 
            success: false,
            message: 'Invalid or expired token' 
        });
        return;
    }

    if (isCloudinaryError(error)) {
        res.status(error.http_code).json({ 
            success: false,
            message: error.message 
        });
        return;
    }

    if (error instanceof MulterError) {
        const { status, message } = handleMulterError(error);
        res.status(status).json({ 
            success: false,
            message 
        });
        return;
    }

    if (error instanceof AxiosError) {
        res.status(error.response?.status || INTERNAL_SERVER_ERROR).json({
            message: error.response?.data?.message || 'External API request failed',
            errorDetails: {
                url: error.config?.url,
                method: error.config?.method,
                status: error.response?.status,
            },
        });
        return;
    }

    if (error instanceof MongooseError) {
        res.status(INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Database error occurred',
            errorDetails: error.message,
        });
        return;
    }
    

    if (process.env.NODE_ENV === SERVER.DEVELOPMENT) {
        sendErrorToDev(error, res);
    } else {
        sendErrorToProd(res);
    }
};

const sendErrorToDev = (error: ErrorType, res: Response): void => {
    res.status(INTERNAL_SERVER_ERROR).json({
        sucess: false,
        cause: 'Internal server error',
        message: error.message,
        stack: error.stack,
    });
};

const sendErrorToProd = (res: Response): void => {
    res.status(INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Internal server error: Please try again later...',
    });
};


const isCloudinaryError = (error: unknown): error is UploadApiErrorResponse => {
    return (
        typeof error === 'object' &&
        error !== null &&
        'http_code' in (error as Record<string, unknown>) &&
        'message' in (error as Record<string, unknown>)
    );
};

const handleMulterError = (
    error: MulterError,
): { status: number; message: string } => {
        const errorMap: Record<string, { status: number; message: string }> = {
        LIMIT_FILE_SIZE: {
            status: PAYLOAD_TOO_LARGE,
            message: 'File size too large. Please upload a smaller file.',
        },
        LIMIT_FILE_COUNT: {
            status: BAD_REQUEST,
            message: 'Too many files uploaded. Please upload fewer files.',
        },
        LIMIT_UNEXPECTED_FILE: {
            status: BAD_REQUEST,
            message: 'Unexpected file field. Please check the field name.',
        },
    };

    return (
        errorMap[error.code] || {
            status: INTERNAL_SERVER_ERROR,
            message: 'File upload error. Please try again later.',
        }
    );
};
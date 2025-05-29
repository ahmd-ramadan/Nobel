"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const axios_1 = require("axios");
const jsonwebtoken_1 = require("jsonwebtoken");
const multer_1 = require("multer");
const zod_1 = require("zod");
const mongoose_1 = require("mongoose");
const utils_1 = require("../utils");
const errorHandler = (error, _req, res, _next) => {
    var _a, _b, _c, _d, _e, _f;
    if (error instanceof utils_1.ApiError) {
        res.status(error.status).json({
            success: false,
            message: error.message
        });
        return;
    }
    if (error instanceof zod_1.ZodError) {
        res.status(utils_1.BAD_REQUEST).json({
            message: 'Validation failed',
            success: false,
            errors: error.issues.map((issue) => ({
                field: issue.path.join('.'),
                message: issue.message,
            })),
        });
        return;
    }
    if (error instanceof jsonwebtoken_1.JsonWebTokenError) {
        res.status(utils_1.UNAUTHORIZED).json({
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
    if (error instanceof multer_1.MulterError) {
        const { status, message } = handleMulterError(error);
        res.status(status).json({
            success: false,
            message
        });
        return;
    }
    if (error instanceof axios_1.AxiosError) {
        res.status(((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) || utils_1.INTERNAL_SERVER_ERROR).json({
            message: ((_c = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.message) || 'External API request failed',
            errorDetails: {
                url: (_d = error.config) === null || _d === void 0 ? void 0 : _d.url,
                method: (_e = error.config) === null || _e === void 0 ? void 0 : _e.method,
                status: (_f = error.response) === null || _f === void 0 ? void 0 : _f.status,
            },
        });
        return;
    }
    if (error instanceof mongoose_1.MongooseError) {
        res.status(utils_1.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Database error occurred',
            errorDetails: error.message,
        });
        return;
    }
    if (process.env.NODE_ENV === utils_1.SERVER.DEVELOPMENT) {
        sendErrorToDev(error, res);
    }
    else {
        sendErrorToProd(res);
    }
};
exports.errorHandler = errorHandler;
const sendErrorToDev = (error, res) => {
    res.status(utils_1.INTERNAL_SERVER_ERROR).json({
        sucess: false,
        cause: 'Internal server error',
        message: error.message,
        stack: error.stack,
    });
};
const sendErrorToProd = (res) => {
    res.status(utils_1.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Internal server error: Please try again later...',
    });
};
const isCloudinaryError = (error) => {
    return (typeof error === 'object' &&
        error !== null &&
        'http_code' in error &&
        'message' in error);
};
const handleMulterError = (error) => {
    const errorMap = {
        LIMIT_FILE_SIZE: {
            status: utils_1.PAYLOAD_TOO_LARGE,
            message: 'File size too large. Please upload a smaller file.',
        },
        LIMIT_FILE_COUNT: {
            status: utils_1.BAD_REQUEST,
            message: 'Too many files uploaded. Please upload fewer files.',
        },
        LIMIT_UNEXPECTED_FILE: {
            status: utils_1.BAD_REQUEST,
            message: 'Unexpected file field. Please check the field name.',
        },
    };
    return (errorMap[error.code] || {
        status: utils_1.INTERNAL_SERVER_ERROR,
        message: 'File upload error. Please try again later.',
    });
};

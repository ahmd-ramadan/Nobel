"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.twentyFourHourLimiter = exports.oneMinuteLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const utils_1 = require("../utils");
exports.oneMinuteLimiter = (0, express_rate_limit_1.default)({
    windowMs: utils_1.MAGIC_NUMBERS.ONE_MINUTE_IN_MILLISECONDS,
    max: utils_1.MAGIC_NUMBERS.MAX_NUMBER_OF_ALLOWED_REQUESTS.ONE,
    message: 'Too many requests, please try again after a minute',
    handler: (_req, res, _next, options) => {
        res.status(utils_1.TOO_MANY_REQUESTS).json({
            error: 'Rate limit exceeded',
            details: options.message,
            retryAfter: `${options.windowMs / 1000} seconds`,
        });
    },
});
exports.twentyFourHourLimiter = (0, express_rate_limit_1.default)({
    windowMs: utils_1.MAGIC_NUMBERS.ONE_DAY_IN_MILLISECONDS,
    max: utils_1.MAGIC_NUMBERS.MAX_NUMBER_OF_ALLOWED_REQUESTS.TEN,
    message: 'Too many requests, please try again after a day',
    handler: (_req, res, _next, options) => {
        res.status(utils_1.TOO_MANY_REQUESTS).json({
            error: 'Rate limit exceeded',
            details: options.message,
            retryAfter: `${options.windowMs / 1000} seconds`,
        });
    },
});

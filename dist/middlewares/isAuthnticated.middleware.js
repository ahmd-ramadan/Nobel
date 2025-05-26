"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthunticated = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const services_1 = require("../services");
const utils_1 = require("../utils");
exports.isAuthunticated = (0, express_async_handler_1.default)((req, _res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new utils_1.ApiError('Unauthorized - No Prefix Token', utils_1.UNAUTHORIZED));
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return next(new utils_1.ApiError('Unauthorized - No Token', utils_1.UNAUTHORIZED));
    }
    // const isInvalidated = await redisService.get(`invalidated-tokens:${token}`);
    // if (isInvalidated) {
    //   throw new ApiError('Session expired, please log in again', UNAUTHORIZED);
    // }
    const decoded = services_1.JwtService.verify(token, 'refresh');
    const user = yield services_1.userService.findUserById(decoded.userId);
    if (!user || user.isBlocked) {
        return next(new utils_1.ApiError('User not found, mybe had deleted by admin', utils_1.UNAUTHORIZED));
    }
    req.user = { userId: decoded.userId, role: decoded.role };
    next();
}));

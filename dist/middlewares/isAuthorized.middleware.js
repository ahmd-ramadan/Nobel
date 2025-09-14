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
exports.isAuthorized = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const utils_1 = require("../utils");
const isAuthorized = (allowedRoles) => {
    return (0, express_async_handler_1.default)((req, _res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const role = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role;
        if (!allowedRoles.includes(role)) {
            // return next(new ApiError('غير مسموح لك بإكمال هذه العملية', UNAUTHORIZED));
            return next(new utils_1.ApiError('Not allowed for you to compelete this process', utils_1.UNAUTHORIZED));
        }
        next();
    }));
};
exports.isAuthorized = isAuthorized;

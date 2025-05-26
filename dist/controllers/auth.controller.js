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
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.login = void 0;
const services_1 = require("../services");
const utils_1 = require("../utils");
const validation_1 = require("../validation");
const error_messages_1 = require("../constants/error.messages");
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = validation_1.loginSchema.parse(req.body);
    const userInfo = yield services_1.authService.login({ username, password });
    res.status(utils_1.OK).json({
        success: true,
        message: error_messages_1.ValidationErrorMessages.LOGIN_SUCCESS,
        data: {
            user: userInfo.data,
            token: userInfo.token
        }
    });
});
exports.login = login;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const userId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const refreshToken = ((_b = req === null || req === void 0 ? void 0 : req.headers['authorization']) === null || _b === void 0 ? void 0 : _b.split(' ')[1]) || "";
    yield services_1.authService.logout({ userId, refreshToken });
    res.status(utils_1.OK).json({
        success: true,
        message: error_messages_1.ValidationErrorMessages.LOGOUT_SUCCESS
    });
});
exports.logout = logout;

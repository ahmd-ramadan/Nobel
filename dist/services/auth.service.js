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
exports.authService = void 0;
const utils_1 = require("../utils");
// import { HashingService } from "./hashing.service";
const user_service_1 = require("./user.service");
const token_service_1 = require("./token.service");
const jwt_service_1 = require("./jwt.service");
const interfaces_1 = require("../interfaces");
const error_messages_1 = require("../constants/error.messages");
const repositories_1 = require("../repositories");
const tracking_service_1 = require("./tracking.service");
class AuthService {
    login(_a) {
        return __awaiter(this, arguments, void 0, function* ({ username, password }) {
            try {
                let user = yield user_service_1.userService.findUserByUserName(username);
                if (!user || !user.password) {
                    throw new utils_1.ApiError(error_messages_1.ValidationErrorMessages.INVALID_CREDENTIALS, utils_1.UNAUTHORIZED);
                }
                // const passwordMatches = await HashingService.compare(
                //     password,
                //     user?.password,
                // );
                if (password !== user.password) {
                    throw new utils_1.ApiError(error_messages_1.ValidationErrorMessages.INVALID_CREDENTIALS, utils_1.UNAUTHORIZED);
                }
                if (user.isBlocked) {
                    throw new utils_1.ApiError(error_messages_1.ValidationErrorMessages.USER_IS_BLOCKED, utils_1.FORBIDDEN);
                }
                const token = (yield this.generateAndStoreTokens(user)).refreshToken;
                user = yield repositories_1.userRepository.updateOne({ _id: user._id }, { isActive: true });
                // Track login
                yield tracking_service_1.trackingService.addNewTracking({ type: interfaces_1.TrackingTypesEnum.LOGIN, userId: user === null || user === void 0 ? void 0 : user._id.toString() });
                return { data: user, token };
            }
            catch (error) {
                if (error instanceof utils_1.ApiError) {
                    throw error;
                }
                throw new utils_1.ApiError(error_messages_1.ValidationErrorMessages.LOGIN_FAILED, utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
    logout(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId, refreshToken }) {
            try {
                const storedToken = yield token_service_1.tokenService.tokenExists(refreshToken);
                if (!storedToken) {
                    throw new utils_1.ApiError(error_messages_1.ValidationErrorMessages.UNAUTHORIZED_ACCESS, utils_1.UNAUTHORIZED);
                }
                yield token_service_1.tokenService.deleteOne({ userId, token: refreshToken });
                yield repositories_1.userRepository.updateOne({ _id: userId }, { isActive: false });
                yield tracking_service_1.trackingService.addNewTracking({ type: interfaces_1.TrackingTypesEnum.LOGOUT, userId });
            }
            catch (error) {
                if (error instanceof utils_1.ApiError) {
                    throw error;
                }
                throw new utils_1.ApiError(error_messages_1.ValidationErrorMessages.LOGOUT_FAILED, utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
    generateAndStoreTokens(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const { _id: userId, role } = user;
            const tokens = jwt_service_1.JwtService.generateTokens(user);
            yield token_service_1.tokenService.createOne({
                token: tokens.refreshToken,
                userId,
                expiresAt: new Date(Date.now() + utils_1.MAGIC_NUMBERS.ONE_WEEK_IN_MILLISECONDS),
            });
            return tokens;
        });
    }
}
exports.authService = new AuthService();

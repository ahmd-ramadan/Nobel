"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenExpiry = exports.accessTokenExpiry = exports.refreshTokenSecret = exports.accessTokenSecret = exports.bcryptSaltRounds = void 0;
const env_1 = __importDefault(require("./env"));
exports.bcryptSaltRounds = (0, env_1.default)('BCRYPT_SALT_ROUNDS');
exports.accessTokenSecret = (0, env_1.default)('ACCESS_TOKEN_SECRET');
exports.refreshTokenSecret = (0, env_1.default)('REFRESH_TOKEN_SECRET');
exports.accessTokenExpiry = (0, env_1.default)('ACCESS_TOKEN_EXPIRY');
exports.refreshTokenExpiry = (0, env_1.default)('REFRESH_TOKEN_EXPIRY');

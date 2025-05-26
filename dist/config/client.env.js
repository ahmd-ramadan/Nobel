"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientUrl = void 0;
const env_1 = __importDefault(require("./env"));
exports.clientUrl = (0, env_1.default)('CLIENT_URL');

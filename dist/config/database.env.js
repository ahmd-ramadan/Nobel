"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongodbUrl = void 0;
const env_1 = __importDefault(require("./env"));
exports.mongodbUrl = (0, env_1.default)('MONGODB_URI');

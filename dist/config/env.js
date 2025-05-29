"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const utils_1 = require("../utils");
dotenv_1.default.config({ path: '.env.local' });
function env(name, required = true) {
    const value = process.env[name];
    if (required && !value) {
        utils_1.logger.error(`Environment variable ${name} is required but not found.`);
        process.exit(1);
    }
    return value;
}
exports.default = env;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    username: zod_1.z
        .string()
        .regex(/^[a-z0-9_-]{3,20}$/, 'Username must be 3-20 characters and can only contain lowercase letters, numbers, underscores, and hyphens')
        .toLowerCase()
        .trim(),
    password: zod_1.z.string().regex(/^(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>])(?=.*[A-Za-z]).{8,}$/, 'Password: 8+ chars, 1 number, 1 special, 1 lowercase or uppercase'),
});
exports.logoutSchema = zod_1.z.object({
    token: zod_1.z.string().trim(),
});

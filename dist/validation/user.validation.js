"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blockUserSchema = exports.deleteUserSchema = exports.updateUserSchema = exports.addUserSchema = exports.updateUserPasswordSchema = exports.updateUserProfileSchema = void 0;
const zod_1 = require("zod");
const utils_1 = require("../utils");
const enums_1 = require("../enums");
const error_messages_1 = require("../constants/error.messages");
exports.updateUserProfileSchema = zod_1.z
    .object({
    name: zod_1.z.coerce.string().min(3, error_messages_1.ValidationErrorMessages.INVALID_NAME).trim().optional(),
    phone: zod_1.z
        .string()
        .regex(/^(?:\+20|0)?(10|11|12|15)\d{8}$/, error_messages_1.ValidationErrorMessages.INVALID_PHONE)
        .trim().optional(),
    username: zod_1.z
        .string()
        .regex(/^[a-z0-9_-]{3,20}$/, error_messages_1.ValidationErrorMessages.INVALID_USERNAME)
        .toLowerCase()
        .trim()
        .optional(),
    password: zod_1.z.string()
        .regex(/^(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>])(?=.*[A-Za-z]).{8,}$/, error_messages_1.ValidationErrorMessages.INVALID_PASSWORD)
        .trim()
        .optional(),
});
exports.updateUserPasswordSchema = zod_1.z
    .object({
    oldPassword: zod_1.z
        .string()
        .regex(/^(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>])(?=.*[A-Za-z]).{8,}$/, error_messages_1.ValidationErrorMessages.INVALID_PASSWORD)
        .trim(),
    newPassword: zod_1.z
        .string()
        .regex(/^(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>])(?=.*[A-Za-z]).{8,}$/, error_messages_1.ValidationErrorMessages.INVALID_PASSWORD)
        .trim(),
});
exports.addUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(3, error_messages_1.ValidationErrorMessages.INVALID_NAME).trim(),
    username: zod_1.z
        .string()
        .regex(/^[a-z0-9_-]{3,20}$/, error_messages_1.ValidationErrorMessages.INVALID_USERNAME)
        .toLowerCase()
        .trim(),
    password: zod_1.z.string().regex(/^(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>])(?=.*[A-Za-z]).{8,}$/, error_messages_1.ValidationErrorMessages.INVALID_PASSWORD),
});
exports.updateUserSchema = zod_1.z.object({
    userId: zod_1.z.string().regex(utils_1.MongoDBObjectId, error_messages_1.ValidationErrorMessages.INVALID_ADMIN_ID),
    name: zod_1.z.string().optional(),
    username: zod_1.z
        .string()
        .regex(/^[a-z0-9_-]{3,20}$/, error_messages_1.ValidationErrorMessages.INVALID_USERNAME)
        .toLowerCase()
        .trim()
        .optional(),
    password: zod_1.z.string()
        .regex(/^(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>])(?=.*[A-Za-z]).{8,}$/, error_messages_1.ValidationErrorMessages.INVALID_PASSWORD)
        .trim()
        .optional(),
});
exports.deleteUserSchema = zod_1.z.object({
    userId: zod_1.z.string().regex(utils_1.MongoDBObjectId, error_messages_1.ValidationErrorMessages.INVALID_ADMIN_ID),
    type: zod_1.z.nativeEnum(enums_1.DeleteUserTypes)
});
exports.blockUserSchema = zod_1.z.object({
    userId: zod_1.z.string().regex(utils_1.MongoDBObjectId, error_messages_1.ValidationErrorMessages.INVALID_ADMIN_ID),
});

import { z } from "zod";
import { MongoDBObjectId } from "../utils";
import { DeleteUserTypes } from "../enums";
import { ValidationErrorMessages } from "../constants/error.messages";

export const updateUserProfileSchema = z
.object({
    name: z.coerce.string().min(3, ValidationErrorMessages.INVALID_NAME).trim().optional(),
    phone: z
        .string()
        .regex(
            /^(?:\+20|0)?(10|11|12|15)\d{8}$/,
            ValidationErrorMessages.INVALID_PHONE,
        )
        .trim().optional(),
    username: z
        .string()
        .regex(
            /^[a-z0-9_-]{3,20}$/,
            ValidationErrorMessages.INVALID_USERNAME
        )
        .toLowerCase()
        .trim()
        .optional(),
    password: z.string()
        .regex(
            /^(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>])(?=.*[A-Za-z]).{8,}$/,
            ValidationErrorMessages.INVALID_PASSWORD,
        )
        .trim()
        .optional(),
})

export const updateUserPasswordSchema = z
.object({
    oldPassword: z
            .string()
            .regex(
                /^(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>])(?=.*[A-Za-z]).{8,}$/,
                ValidationErrorMessages.INVALID_PASSWORD,
            )
            .trim(),
    newPassword: z
            .string()
            .regex(
                /^(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>])(?=.*[A-Za-z]).{8,}$/,
                ValidationErrorMessages.INVALID_PASSWORD,
            )
            .trim(),
})

export const addUserSchema = z.object({
    name: z.string().min(3, ValidationErrorMessages.INVALID_NAME).trim(),
    username: z
        .string()
        .regex(
            /^[a-z0-9_-]{3,20}$/,
            ValidationErrorMessages.INVALID_USERNAME
        )
        .toLowerCase()
        .trim(),
    password: z.string().regex(
        /^(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>])(?=.*[A-Za-z]).{8,}$/,
        ValidationErrorMessages.INVALID_PASSWORD
    ),
})

export const updateUserSchema = z.object({
    userId: z.string().regex(MongoDBObjectId, ValidationErrorMessages.INVALID_ADMIN_ID),
    name: z.string().optional(),
    username: z
        .string()
        .regex(
            /^[a-z0-9_-]{3,20}$/,
            ValidationErrorMessages.INVALID_USERNAME
        )
        .toLowerCase()
        .trim()
        .optional(),
    password: z.string()
            .regex(
                /^(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>])(?=.*[A-Za-z]).{8,}$/,
                ValidationErrorMessages.INVALID_PASSWORD,
            )
            .trim()
            .optional(),
})

export const deleteUserSchema = z.object({
    userId: z.string().regex(MongoDBObjectId, ValidationErrorMessages.INVALID_ADMIN_ID),
    type: z.nativeEnum(DeleteUserTypes)
})

export const blockUserSchema = z.object({
    userId: z.string().regex(MongoDBObjectId, ValidationErrorMessages.INVALID_ADMIN_ID),
})
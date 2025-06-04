"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllRPMsSchema = exports.updateRPMSchema = exports.createRPMSchema = void 0;
const zod_1 = require("zod");
const utils_1 = require("../utils");
exports.createRPMSchema = zod_1.z.object({
    modelId: zod_1.z.string().regex(utils_1.MongoDBObjectId, 'Invalid modelId'),
    rpm: zod_1.z.number().int().positive()
});
exports.updateRPMSchema = zod_1.z.object({
    modelId: zod_1.z.string().regex(utils_1.MongoDBObjectId, 'Invalid modelId').optional(),
    rpm: zod_1.z.number().int().positive().optional()
});
exports.getAllRPMsSchema = zod_1.z.object({
    modelId: zod_1.z.string().regex(utils_1.MongoDBObjectId, 'Invalid modelId').optional(),
});

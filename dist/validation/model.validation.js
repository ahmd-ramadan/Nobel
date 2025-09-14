"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllModelsSchema = exports.updateModelSchema = exports.addModelSchema = exports.modelPoint = void 0;
const zod_1 = require("zod");
const interfaces_1 = require("../interfaces");
exports.modelPoint = zod_1.z.object({
    rpm: zod_1.z.number(),
    flowRate: zod_1.z.number(),
    totalPressure: zod_1.z.number(),
    efficiency: zod_1.z.number(),
    lpa: zod_1.z.number()
});
exports.addModelSchema = zod_1.z.object({
    type: zod_1.z.nativeEnum(interfaces_1.ModelTypesEnum),
    name: zod_1.z.string(),
    factor: zod_1.z.number(),
    desc: zod_1.z.string().optional(),
    startRpmNumber: zod_1.z.number().positive().int(),
    endRpmNumber: zod_1.z.number().positive().int(),
    points: zod_1.z.array(exports.modelPoint).length(5)
});
exports.updateModelSchema = zod_1.z.object({
    type: zod_1.z.nativeEnum(interfaces_1.ModelTypesEnum).optional(),
    name: zod_1.z.string().optional(),
    desc: zod_1.z.string().optional(),
    startRpmNumber: zod_1.z.number().positive().int().optional(),
    endRpmNumber: zod_1.z.number().positive().int().optional(),
    points: zod_1.z.array(exports.modelPoint).length(5).optional()
});
exports.getAllModelsSchema = zod_1.z.object({
    type: zod_1.z.nativeEnum(interfaces_1.ModelTypesEnum).optional(),
});

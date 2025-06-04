"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const utils_1 = require("../utils");
const addPointSchema = zod_1.z.object({
    index: zod_1.z.number().int().positive(),
    flowRate: zod_1.z.number(),
    totalPressure: zod_1.z.number(),
    velocity: zod_1.z.number(),
    brakePower: zod_1.z.number(),
    efficiency: zod_1.z.number(),
    lpa: zod_1.z.number()
});
const rpmSchema = zod_1.z.object({
    modelId: zod_1.z.string().regex(utils_1.MongoDBObjectId, 'Invalid modelId'),
    rpm: zod_1.z.number().int().positive(),
    points: zod_1.z.array(addPointSchema).length(1000)
});

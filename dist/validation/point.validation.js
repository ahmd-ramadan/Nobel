"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addPointsDataSchema = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const zod_1 = require("zod");
const utils_1 = require("../utils");
const addPointSchema = zod_1.z.object({
    index: zod_1.z.number().int(),
    flowRate: zod_1.z.number(),
    totalPressure: zod_1.z.number(),
    velocity: zod_1.z.number(),
    brakePower: zod_1.z.number(),
    efficiency: zod_1.z.number(),
    lpa: zod_1.z.number()
});
const rpmSchema = zod_1.z.object({
    rpm: zod_1.z.number().int().positive(),
    points: zod_1.z.array(addPointSchema).length(1000)
});
exports.addPointsDataSchema = zod_1.z.object({
    modelId: zod_1.z.string().regex(utils_1.MongoDBObjectId, 'Invalid modelId'),
    rpm: zod_1.z.number().int().positive(),
    points: zod_1.z.array(addPointSchema).length(1000)
});
const addDataSchema = zod_1.z.object({
    modelId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid modelId'),
    rpms: zod_1.z.array(rpmSchema)
});
function generateRandomPoint(index) {
    return {
        index,
        flowRate: parseFloat((Math.random() * 10).toFixed(5)),
        totalPressure: parseFloat((Math.random() * 100).toFixed(5)),
        velocity: parseFloat((Math.random() * 50).toFixed(5)),
        brakePower: parseFloat((Math.random() * 20).toFixed(5)),
        efficiency: parseFloat((Math.random() * 100).toFixed(5)),
        lpa: parseFloat((Math.random() * 30).toFixed(5)),
    };
}
function generateRpm(rpmValue) {
    const points = Array.from({ length: 1000 }, (_, i) => generateRandomPoint(i));
    return { rpm: rpmValue, points };
}
function generateTestData(modelId, start = 900, end = 1000, step = 1000) {
    let rpmObject = {};
    for (let rpm = start; rpm <= end; rpm += step) {
        // rpm.push(generateRpm(rpm));
        rpmObject = generateRpm(rpm);
    }
    const payload = Object.assign({ modelId }, rpmObject);
    // const parsed = addDataSchema.safeParse(payload);
    // if (!parsed.success) {
    //     console.error("❌ Validation failed:", parsed.error.format());
    //     throw new Error("Generated data failed schema validation");
    // }
    return payload;
}
function saveToJson(data, fileName = 'outputv1.json') {
    const filePath = path_1.default.join(__dirname, fileName);
    fs_1.default.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`✅ Saved to ${filePath}`);
}
// --- Run ---
// const modelId = "683ef5a9d1e754aa2199b5f6";
// const data = generateTestData(modelId, 900, 900, 1); 
// saveToJson(data);

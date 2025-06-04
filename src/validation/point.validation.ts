import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { MongoDBObjectId } from '../utils';

const addPointSchema = z.object({
    index: z.number().int(),
    flowRate: z.number(),
    totalPressure: z.number(),
    velocity: z.number(),
    brakePower: z.number(),
    efficiency: z.number(),
    lpa: z.number()
});

const rpmSchema = z.object({
    rpm: z.number().int().positive(),
    points: z.array(addPointSchema).length(1000)
});

export const addPointsDataSchema = z.object({
    modelId: z.string().regex(MongoDBObjectId, 'Invalid modelId'),
    rpm: z.number().int().positive(),
    points: z.array(addPointSchema).length(1000)
});

const addDataSchema = z.object({
    modelId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid modelId'),
    rpms: z.array(rpmSchema)
});


function generateRandomPoint(index: number) {
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

function generateRpm(rpmValue: number) {
    const points = Array.from({ length: 1000 }, (_, i) => generateRandomPoint(i));
    return { rpm: rpmValue, points };
}

function generateTestData(modelId: string, start = 900, end = 1000, step = 1000) {
    let rpmObject: any = {};
    for (let rpm = start; rpm <= end; rpm += step) {
        // rpm.push(generateRpm(rpm));
        rpmObject = generateRpm(rpm);

    }

    const payload = { modelId, ...rpmObject };

    // const parsed = addDataSchema.safeParse(payload);
    // if (!parsed.success) {
    //     console.error("❌ Validation failed:", parsed.error.format());
    //     throw new Error("Generated data failed schema validation");
    // }

    return payload;
}

function saveToJson(data: any, fileName = 'outputv1.json') {
    const filePath = path.join(__dirname, fileName);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`✅ Saved to ${filePath}`);
}

// --- Run ---
// const modelId = "683ef5a9d1e754aa2199b5f6";
// const data = generateTestData(modelId, 900, 900, 1); 
// saveToJson(data);

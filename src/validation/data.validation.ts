import { z } from 'zod';
import { MongoDBObjectId } from '../utils';

const addPointSchema = z.object({
    index: z.number().int().positive(),
    flowRate: z.number(),
    totalPressure: z.number(),
    velocity: z.number(),
    brakePower: z.number(),
    efficiency: z.number(),
    lpa: z.number()
});

const rpmSchema = z.object({
    modelId: z.string().regex(MongoDBObjectId, 'Invalid modelId'),
    rpm: z.number().int().positive(),
    points: z.array(addPointSchema).length(1000)
});
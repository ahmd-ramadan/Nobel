import { z } from 'zod';
import { MongoDBObjectId } from '../utils';

export const paramsSchema = z.object({
    _id: z.string().regex(MongoDBObjectId, "Invalid MongoDB ObjectId"),
});
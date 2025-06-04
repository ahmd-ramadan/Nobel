import { z } from "zod";
import { MongoDBObjectId } from "../utils";


export const createRPMSchema = z.object({
    modelId: z.string().regex(MongoDBObjectId, 'Invalid modelId'),
    rpm: z.number().int().positive()
}) 

export const updateRPMSchema = z.object({
    modelId: z.string().regex(MongoDBObjectId, 'Invalid modelId').optional(),
    rpm: z.number().int().positive().optional()
}) 

export const getAllRPMsSchema = z.object({
    modelId: z.string().regex(MongoDBObjectId, 'Invalid modelId').optional(),
})
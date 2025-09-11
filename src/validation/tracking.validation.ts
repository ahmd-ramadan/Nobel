import { z } from "zod";
import { TrackingTypesEnum } from "../interfaces";
import { MongoDBObjectId } from "../utils";

export const getAllTracksSchema = z.object({
    type: z.nativeEnum(TrackingTypesEnum).optional(),
    userId: z.string().regex(MongoDBObjectId).optional()
}) 

export const addReportForModelSchema = z.object({
    trackId: z.string().regex(MongoDBObjectId),
    modelId: z.string().regex(MongoDBObjectId)
}) 
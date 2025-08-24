import { z } from "zod";
import { TrackingTypesEnum } from "../interfaces";
import { MongoDBObjectId } from "../utils";

export const getAllTracksSchema = z.object({
    type: z.nativeEnum(TrackingTypesEnum).optional(),
    userId: z.string().regex(MongoDBObjectId).optional()
}) 
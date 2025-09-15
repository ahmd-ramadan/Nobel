import { z } from "zod";
import { ModelTypesEnum } from "../interfaces";

export const modelPoint = z.object({
    rpm: z.number(),
    flowRate: z.number(),
    totalPressure: z.number(),
    efficiency: z.number(),
    lpa: z.number()
})

export const addModelSchema = z.object({
    type: z.nativeEnum(ModelTypesEnum),
    name: z.string(),
    factor: z.number(),
    desc: z.string().optional(),
    startRpmNumber: z.number().positive().int(),
    endRpmNumber: z.number().positive().int(),
    points: z.array(modelPoint).length(5)
}) 

export const updateModelSchema = z.object({
    type: z.nativeEnum(ModelTypesEnum).optional(),
    name: z.string().optional(),
    factor: z.number().optional(),
    desc: z.string().optional(),
    startRpmNumber: z.number().positive().int().optional(),
    endRpmNumber: z.number().positive().int().optional(),
    points: z.array(modelPoint).length(5).optional()
}) 

export const getAllModelsSchema = z.object({
    type: z.nativeEnum(ModelTypesEnum).optional(),
})
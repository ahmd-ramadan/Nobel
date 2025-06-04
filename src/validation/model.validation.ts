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
    desc: z.string().optional(),
    points: z.array(modelPoint).length(5)
}) 

export const updateModelSchema = z.object({
    type: z.nativeEnum(ModelTypesEnum).optional(),
    name: z.string().optional(),
    desc: z.string().optional(),
    points: z.array(modelPoint).length(5).optional()
}) 

export const getAllModelsSchema = z.object({
    type: z.nativeEnum(ModelTypesEnum).optional(),
})
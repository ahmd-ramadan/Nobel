import { z } from "zod";
import { AxialOptionsEnum, AxialTypesEnum, FlowRateUnitsEnum, ModelTypesEnum, StaticPressureUnitsEnum } from "../interfaces";

export const serachInputSchema = z.object({
    flowRate: z.number(),
    flowRateUnit: z.nativeEnum(FlowRateUnitsEnum),
    staticPressure: z.number(),
    staticPressureUnit: z.nativeEnum(StaticPressureUnitsEnum),
    modelType: z.nativeEnum(ModelTypesEnum),
    axialType: z.nativeEnum(AxialTypesEnum).optional(),
    axialOption: z.nativeEnum(AxialOptionsEnum).optional(), 
}).refine((data) => {
    if(data.modelType === ModelTypesEnum.AXIAL) {
        if(data.axialOption === undefined || data.axialOption === undefined) return false;
        if(data.axialType === AxialTypesEnum.NEI2D && data.axialOption === AxialOptionsEnum.BELT_DRIVE) return false;
        return true
    }
    if(data.modelType === ModelTypesEnum.CENTRIFUGAL) {

        return true
    }
    return false;
}, 
{
    message: "Invalid model configuration",
});
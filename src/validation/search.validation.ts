import { z } from "zod";
import { AxialOptionsEnum, AxialTypesEnum, CentrifugalTypesEnum, ConfigurationTypesEnum, FlowRateUnitsEnum, ModelTypesEnum, PressureTypesEnum, StaticPressureUnitsEnum } from "../interfaces";

export const serachInputSchema = z.object({
    flowRate: z.number(),
    flowRateUnit: z.nativeEnum(FlowRateUnitsEnum),
    staticPressure: z.number(),
    staticPressureUnit: z.nativeEnum(StaticPressureUnitsEnum),
    modelType: z.nativeEnum(ModelTypesEnum),
    axialType: z.nativeEnum(AxialTypesEnum).optional(),
    axialOption: z.nativeEnum(AxialOptionsEnum).optional(), 
    pressureType: z.nativeEnum(PressureTypesEnum).optional(),
    configurationType: z.nativeEnum(ConfigurationTypesEnum).optional(),
    centrifugalType: z.nativeEnum(CentrifugalTypesEnum).optional()

    
}).refine((data) => {
    if(data.modelType === ModelTypesEnum.AXIAL) {
        if(data.axialOption === undefined || data.axialOption === undefined) return false;
        if(data.axialType === AxialTypesEnum.NEI2D && data.axialOption === AxialOptionsEnum.BELT_DRIVE) return false;
        return true
    }
    if(data.modelType === ModelTypesEnum.CENTRIFUGAL) {
        if(data.pressureType === undefined || data.centrifugalType === undefined) return false;
        if(data.pressureType === PressureTypesEnum.LOW && data.configurationType === undefined) return false;
        return true
    }
    return false;
}, 
{
    message: "Invalid model configuration",
});
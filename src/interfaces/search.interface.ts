import { ModelTypesEnum } from "./model.interface";
import { IPointModel } from "./point.interface";

export interface ISearchInput {
    flowRate: number,
    flowRateUnit: FlowRateUnitsEnum,
    staticPressure: number,
    staticPressureUnit: StaticPressureUnitsEnum,
    modelType: ModelTypesEnum,
    axialType?: AxialTypesEnum,
    axialOption?: AxialOptionsEnum
}

export enum FlowRateUnitsEnum {
    M3S = 'm3/s',
    M3H = "m3/hr",
    LS = "l/s",
    CFM = 'cfm'
}

export enum StaticPressureUnitsEnum {
    PA = 'Pa',
    INWC = 'InWc',
    KPA = 'kPa',
    BAR = 'bar'    
}

export enum AxialTypesEnum {
    NETD = 'NETD',
    NEID = 'NEID',
    NEIDS = 'NEIDS',
    NRT = 'NRT',
    NEI2D = 'NEI2D',
    NEI3D = 'NEI3D'
}

export enum AxialOptionsEnum {
    DIRECT_DRIVE = 'DD',
    BELT_DRIVE = 'BD',
    DIRECT_DRIVE_WITH_FREQUANCY_DRIVE = 'BDWF' 
}

export enum AxialModelsAndOptionsBasedOnType {   // startModel-endModel-AllowedOptions
    NETD = '310-1000-3',
    NEID = '250-2240-3', // all
    NEIDS = '250-2240-3', // all
    NRT = '310-1000-3', 
    NEI2D = '310-1250-2',
    NEI3D = '310-1250-3'
}

export enum AxialRPMsBasedOnOption {     // startRPM 
    DD = '800-1000/1300-1500/2800-3000',
    BD = '250-3750', // all
    BDWF = '250-3750', // all
}


export interface ISearchResult {
    model: { 
        _id: string, 
        name: string
    },
    rpm: {
        _id: string,
        rpm: number
    },
    closestPoint: IClosestPoint,
    points: IPointWithPower[]
    
} 

export interface IClosestPoint extends IPointModel {
    totalPressureError: number,
    averageError: number,
    errorDiff: number,
    dynamicPressure: number
}

export interface IPointWithPower extends IPointModel {
    power: number 
} 
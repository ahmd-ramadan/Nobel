import { IDBModel } from "./database.interface";

export interface IModelModel extends IDBModel {
    type: ModelTypesEnum, 
    name: string;
    factor: number;
    desc?: string;
    startRpmNumber: number;
    endRpmNumber: number;
    points: IModelPoint[];
    isComplete: boolean;

    // centrifugal
    pressureType: PressureTypesEnum;
    configurationType?: ConfigurationTypesEnum;
    centrifugalType: CentrifugalTypesEnum;
}

export interface IModel extends IModelModel {}

export enum ModelTypesEnum {
    AXIAL = 'axial',
    CENTRIFUGAL = 'centrifugal',
}

export interface IModelPoint {
    rpm: number,
    flowRate: number,
    totalPressure: number,
    efficiency: number,
    lpa: number
}

export interface ICreateModelData {
    type: ModelTypesEnum;
    name: string;
    factor: number;
    desc?: string;
    startRpmNumber: number;
    endRpmNumber: number;
    points: IModelPoint[]

    pressureType?: PressureTypesEnum;
    configurationType?: ConfigurationTypesEnum;
    centrifugalType?: CentrifugalTypesEnum;
}

export enum PressureTypesEnum {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = 'high'
}

export enum ConfigurationTypesEnum {
    SISW = "SISW",
    DIDW = "DIDW"
}

export enum CentrifugalTypesEnum {
    // Low Pressure
    // SISW
    NBR = "NBR",
    NBS = "NBS",
    NBRS = "NBRS",
    NC = "NC",
    NBXI = "NBXI",
    // DIDW
    NBRD = "NBR-D",
    NBSD = "NBS-D",

    // Medium Pressure
    NPD = "NPD",
    NPE = "NPE",

    // High Pressure
    NPF = "NPF"
}
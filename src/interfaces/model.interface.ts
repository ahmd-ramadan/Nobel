import { IDBModel } from "./database.interface";

export interface IModelModel extends IDBModel {
    type: ModelTypesEnum, 
    name: string;
    desc?: string;
    startRpmNumber: number;
    endRpmNumber: number;
    points: IModelPoint[]
}

export interface IModel extends IModelModel {}

export enum ModelTypesEnum {
    AXIAL = 'axial',
    SYNTROPHIC = 'syntrophic'
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
    desc?: string;
    startRpmNumber: number;
    endRpmNumber: number;
    points: IModelPoint[]
}
import { IDBModel } from "./database.interface";

export interface IPointModel extends IDBModel {
    modelId: string,
    rpmId: string,
    index: number, // 0 to 999

    flowRate: number,
    totalPressure: number,
    velocity: number,
    brakePower: number,
    efficiency: number,
    lpa: number
}

export interface IPoint extends IPointModel {}

export interface ICreatePointData {
    modelId: string,
    rpmId: string,
    index: number, // 0 to 999

    flowRate: number,
    totalPressure: number,
    velocity: number,
    brakePower: number,
    efficiency: number,
    lpa: number
}

export interface IPointData {
    index: number,
    flowRate: number,
    totalPressure: number,
    velocity: number,
    brakePower: number,
    efficiency: number,
    lpa: number
}

export interface ICreatePointsData {
    modelId: string,
    rpm: number,
    points: IPointData[]
}
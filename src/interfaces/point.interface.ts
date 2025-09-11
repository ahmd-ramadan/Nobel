import { IDBModel } from "./database.interface";

export interface IPointModel extends IDBModel {
    modelId: string,
    rpmId: string,
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
    flowRate: number,
    totalPressure: number,
    velocity: number,
    brakePower: number,
    efficiency: number,
    lpa: number
}

export interface IPointData {
    flowRate: number,
    totalPressure: number,
    velocity: number,
    brakePower: number,
    efficiency: number,
    lpa: number
}

export interface ICreatePointsData {
    modelId: string,
    rpmId: string,
    points: IPointData[]
}
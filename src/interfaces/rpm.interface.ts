import { IDBModel } from "./database.interface";

export interface IRPMModel extends IDBModel {
    modelId: string;
    rpm: number;
}

export interface IRPM extends IRPMModel {}

export interface ICreateRPMData {
    modelId: string;
    rpm: number;
}
import { IDBModel } from "./database.interface";
import { IUser } from "./user.interface";

export interface ITrackingModel extends IDBModel {
    userId: string;
    type: TrackingTypesEnum;
}

export interface ITracking extends ITrackingModel {
    userData: IUser
}

export enum TrackingTypesEnum {
    SEARCH = "search",
    LOGIN = "login",
    LOGOUT = "logout"
}
import { IDBModel } from "./database.interface";
import { ISearchResult } from "./search.interface";
import { IUser } from "./user.interface";

export interface ITrackingModel extends IDBModel {
    userId: string;
    type: TrackingTypesEnum;
    searchResults: ITrackSerachResult[]
}

export interface ITrackSerachResult extends Omit<ISearchResult, 'points'> {
    isReported: boolean
}

export interface ITracking extends ITrackingModel {
    userData: IUser
}

export enum TrackingTypesEnum {
    SEARCH = "search",
    LOGIN = "login",
    LOGOUT = "logout"
}
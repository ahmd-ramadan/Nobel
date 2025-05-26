import { UserRolesEnum } from "../enums";
import { IDBModel } from "./database.interface";


export interface IUserModel extends IDBModel {
    name: string;
    username: string;
    role: UserRolesEnum;
    password?: string;
    isBlocked?: string;
}

export interface IUser extends IUserModel {}

export interface ICreateUserQuery {
    name: string;
    username: string;
    password: string;
}
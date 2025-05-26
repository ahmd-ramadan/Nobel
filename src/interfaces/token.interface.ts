import { TokenTypesEnum } from "../enums/token.enums";
import { IDBModel } from "./database.interface";
import { IUser } from "./user.interface";

export interface ITokenModel extends IDBModel {
    token: string,
    userId: string,
    expiresAt: Date
    type?: TokenTypesEnum
}

export interface IToken extends Omit<ITokenModel, 'userId'> {
    user: IUser
}
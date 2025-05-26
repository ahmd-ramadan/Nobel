import { UserRolesEnum } from "../enums";

export interface IJwtPayload {
    userId: string;
    role: UserRolesEnum
    iat?: number;
    exp?: number;
}
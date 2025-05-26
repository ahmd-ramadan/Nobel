
import { User } from "../models";
import { IUserModel, IUser } from "../interfaces";
import GeneralRepository from "./general.repository";

export const userRepository = new GeneralRepository<IUserModel, IUser>(User)
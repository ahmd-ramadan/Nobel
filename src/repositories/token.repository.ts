import { Token } from "../models";
import { ITokenModel, IToken } from "../interfaces";
import GeneralRepository from "./general.repository";

export const tokenRepository = new GeneralRepository<ITokenModel, IToken>(Token)
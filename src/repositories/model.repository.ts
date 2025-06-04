import { Model } from "../models";
import { IModel, IModelModel } from "../interfaces";
import GeneralRepository from "./general.repository";

export const modelRepository = new GeneralRepository<IModelModel, IModel>(Model)
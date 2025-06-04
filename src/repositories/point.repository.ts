import { Point } from "../models";
import { IPoint, IPointModel } from "../interfaces";
import GeneralRepository from "./general.repository";

export const pointRepository = new GeneralRepository<IPointModel, IPoint>(Point)
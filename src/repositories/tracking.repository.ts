import { Tracking } from "../models";
import { ITracking, ITrackingModel } from "../interfaces";
import GeneralRepository from "./general.repository";

export const trackingRepository = new GeneralRepository<ITrackingModel, ITracking>(Tracking)
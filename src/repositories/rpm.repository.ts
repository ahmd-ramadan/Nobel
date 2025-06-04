import { RPM } from "../models";
import { IRPM, IRPMModel } from "../interfaces";
import GeneralRepository from "./general.repository";

export const rpmRepository = new GeneralRepository<IRPMModel, IRPM>(RPM)
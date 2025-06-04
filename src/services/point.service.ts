import { ICreatePointsData, IRPM } from "../interfaces";
import { Point } from "../models";
import { pointRepository } from "../repositories";
import { ApiError, INTERNAL_SERVER_ERROR, NOT_FOUND } from "../utils";
import { rpmService } from "./rpm.service";

class PointService {
    constructor(private readonly pointDataSource = pointRepository){}

    async isPointExists(pointId: string) {
        const point = await this.pointDataSource.findOne({ _id: pointId });
        if(!point) {
            throw new ApiError('Point not found', NOT_FOUND) 
        }
        return point;
    }

    async addPoint({ isUpdate, data }:{ isUpdate: boolean, data: ICreatePointsData }) {
        try {
            const { rpm, modelId, points } = data;
            let addedRPM: IRPM = {} as IRPM;  
            if(isUpdate) {
                addedRPM = await rpmService.isRpmExists({ rpm, modelId });
            } else {
                addedRPM = await rpmService.addRPM({ rpm, modelId });
            }

            if (isUpdate) {
                await this.pointDataSource.deleteMany({ modelId, rpmId: addedRPM._id });
            }

            let newPoints = points.map((point) => {
                return { modelId, rpmId: addedRPM._id, ... point }
            });
            const addedPoints = await pointRepository.insertMany(newPoints);

            return true;
        } catch(error) {
            console.log(error)
            // If any error delete all points and rpms for this model
            if(error instanceof ApiError) throw error
            throw new ApiError('Add points data failed', INTERNAL_SERVER_ERROR)
        }
    }

    // async updateModel({ modelId, data }: { modelId: string, data: Partial<ICreateModelData> }) {
    //     try {
    //         return await this.pointDataSource.updateOne({ _id: modelId }, data);
    //     } catch(error) {
    //         if(error instanceof ApiError) throw error
    //         throw new ApiError('Updated model failed', INTERNAL_SERVER_ERROR)
    //     }
    // }

    // async deleteModel({ modelId }: { modelId: string }) {
    //     try {

    //         const deletedModel = await this.pointDataSource.deleteOne({ _id: modelId });

    //         // Deleted rpms related with this model
    //         // Delete poinsts related with this model
    //         return deletedModel; 
    //     } catch(error) {
    //         if(error instanceof ApiError) throw error
    //         throw new ApiError('Deleted model failed', INTERNAL_SERVER_ERROR)
    //     }
    // }

    // async getAllModels({ type }: { type?: ModelTypesEnum }) {
    //     try {

    //         let query: any = {};
    //         if(type) query.type = type;
            
    //         return await this.pointDataSource.find(query);

    //     } catch(error) {
    //         if(error instanceof ApiError) throw error
    //         throw new ApiError('Deleted model failed', INTERNAL_SERVER_ERROR)
    //     }
    // }
}

export const pointService = new PointService()
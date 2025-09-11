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

    async addPoint({ isUpdate, data }:{ isUpdate: boolean, data: any }) {
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

            let newPoints = points.map((point: any) => {
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

    async addAllPointForRpm(data: ICreatePointsData, retryCount = 0): Promise<any> {
        const maxRetries = 3;
        const retryDelay = 2000; // 2 seconds
        
        try {
            const { rpmId, modelId, points } = data;  
            
            await this.pointDataSource.deleteMany({ modelId, rpmId });

            let newPoints = points.map((point) => {
                return { modelId, rpmId, ... point }
            });

            const addedPoints = await pointRepository.insertMany(newPoints);

            console.log(`✅ Added ${points.length} points for RPM ${rpmId} successfully✅`)
            return addedPoints;
        } catch(error) {
            console.error(`Error adding points for RPM ${data.rpmId} (attempt ${retryCount + 1}/${maxRetries + 1}):`, error);
            
            // Check if it's a network-related error that can be retried
            if (error instanceof Error && (
                error.name === 'MongoNetworkTimeoutError' || 
                error.name === 'MongoNetworkError' ||
                error.message.includes('ENOTFOUND') ||
                error.message.includes('getaddrinfo')
            )) {
                if (retryCount < maxRetries) {
                    console.log(`🔄 Retrying in ${retryDelay}ms... (attempt ${retryCount + 1}/${maxRetries})`);
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                    return this.addAllPointForRpm(data, retryCount + 1);
                } else {
                    throw new ApiError(`Database connection failed after ${maxRetries + 1} attempts for RPM ${data.rpmId}. Please check your network connection and MongoDB Atlas status.`, INTERNAL_SERVER_ERROR)
                }
            }
            
            // If any error delete all points and rpms for this model
            if(error instanceof ApiError) throw error
            throw new ApiError(`Add points data for RPM ${data.rpmId} failed: ${error instanceof Error ? error.message : 'Unknown error'}`, INTERNAL_SERVER_ERROR)
        }
    }

    async getAllPoints({ rpmId, modelId }: { rpmId: string,  modelId?: string }) {
        let query: any = {};
        if(modelId) query.modelId = modelId;
        query.rpmId = rpmId;

        console.log('Query being used:', query);

        return await pointRepository.findWithPopulate(query, [], { limit: 1000 });
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
import { ICreateRPMData, IModel, IPointData } from "../interfaces";
import { rpmRepository } from "../repositories";
import { ApiError, INTERNAL_SERVER_ERROR, NOT_FOUND } from "../utils";
import { calculateDiameter, calculateFirstRpm, generateNextRpmPoints, handleGenerateNextRpm } from "../utils/points.utils";
import { pointService } from "./point.service";

class RPMService {
    constructor(private readonly rpmDataSource = rpmRepository){}

    async isRpmExists({ rpm, modelId }: { rpm: number, modelId: string }) {
        const rpmIsExists = await this.rpmDataSource.findOne({ rpm, modelId });
        if(!rpmIsExists) {
            throw new ApiError('RPM not found', NOT_FOUND) 
        }
        return rpmIsExists;
    }

    async isRpmNotExists({ rpm, modelId }: { modelId: string, rpm: number }) {
        const rpmIsExists = await this.rpmDataSource.findOne({ rpm, modelId });
        if(rpmIsExists) {
            throw new ApiError('RPM is Exists', NOT_FOUND) 
        }
        return rpmIsExists;
    }

    async addRPM(data: ICreateRPMData) {
        try {
            const { rpm, modelId } = data;
            await this.isRpmNotExists({ rpm, modelId })
            return await this.rpmDataSource.createOne(data);
        } catch(error) {
            if(error instanceof ApiError) throw error
            throw new ApiError('Add RPM failed', INTERNAL_SERVER_ERROR)
        }
    }

    async addRPMWithPoints(model: IModel) {
        try {
            const { _id: modelId, startRpmNumber, endRpmNumber, points } = model

            const firstRpm = await this.rpmDataSource.createOne({ modelId, rpm: startRpmNumber });
            if(!firstRpm) {
                throw new ApiError('Add first RPM is failed', INTERNAL_SERVER_ERROR)
            }

            const diameter = calculateDiameter(parseInt(model.name))
            
            // Generate first rpm -> 1000 points
            const firstRpmPoints = calculateFirstRpm(points, startRpmNumber, diameter); 
            await pointService.addAllPointForRpm({ modelId, rpmId: firstRpm._id, points: firstRpmPoints as IPointData[] })
            
            // Process RPMs in batches to avoid overwhelming the database
            const batchSize = 5; // Reduced from 10 to 5 for better stability
            const totalRpms = endRpmNumber - startRpmNumber;
            
            for(let batchStart = startRpmNumber + 1; batchStart <= endRpmNumber; batchStart += batchSize) {
                const batchEnd = Math.min(batchStart + batchSize - 1, endRpmNumber);
                const batchPromises = [];
                
                console.log(`Processing RPMs ${batchStart} to ${batchEnd}...`);
                
                for(let rpm = batchStart; rpm <= batchEnd; rpm++) {
                    const nextRpm = await this.rpmDataSource.createOne({ modelId, rpm });
                    if(!nextRpm) {
                        throw new ApiError('Add next RPM is failed', INTERNAL_SERVER_ERROR)
                    }
                    const nextRpmPoints = handleGenerateNextRpm(firstRpmPoints as IPointData[], startRpmNumber, rpm, diameter) as IPointData[]; 
                    batchPromises.push(pointService.addAllPointForRpm({ modelId, rpmId: nextRpm._id, points: nextRpmPoints as IPointData[] }))
                }
                
                // Wait for current batch to complete before moving to next batch
                await Promise.all(batchPromises);
                
                // Add a longer delay between batches to reduce database load
                if(batchEnd < endRpmNumber) {
                    console.log(`⏳ Waiting 500ms before next batch...`);
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }

        } catch(error) {
            console.error('Error in addRPMWithPoints:', error);
            if(error instanceof ApiError) throw error
            throw new ApiError('Add RPMs Wit Points failed', INTERNAL_SERVER_ERROR)
        }
    }

}

export const rpmService = new RPMService()
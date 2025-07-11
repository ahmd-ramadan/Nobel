import { ICreateModelData, ModelTypesEnum } from "../interfaces";
import { Point, RPM } from "../models";
import { modelRepository } from "../repositories";
import { ApiError, CONFLICT, INTERNAL_SERVER_ERROR, NOT_FOUND } from "../utils";
import { rpmService } from "./rpm.service";

class ModelService {
    constructor(private readonly modelDataSource = modelRepository){}

    async isModelExists(modelId: string) {
        const model = await this.modelDataSource.findOne({ _id: modelId });
        if(!model) {
            throw new ApiError('Model not found', NOT_FOUND) 
        }
        return model;
    }

    async isModelExistsByName(modelName: string) {
        const model = await this.modelDataSource.findOne({ name: modelName });
        return model;
    }

    async addModel(data: ICreateModelData) {
        try {
            const isModelExist = await this.isModelExistsByName(data.name);
            if(isModelExist) {
                throw new ApiError("This model name is exist can't add two models with two names", CONFLICT)
            }
            const model = await this.modelDataSource.createOne(data);
            
            // Process RPMs and points in the background
            process.nextTick(async () => {
                try {
                    console.log(`🚀 Starting background processing for model: ${model.name} (RPMs ${model.startRpmNumber}-${model.endRpmNumber})`)
                    
                    await rpmService.addRPMWithPoints(model)
                    
                    console.log(`\n💯 Successfully completed processing for model: ${model.name} 💯`)
                    
                } catch (error) {
                    console.error(`❌ Error in background processing for model ${model.name}:`, error);
                    // You might want to add error tracking/logging here
                    // Consider updating the model status to indicate failure
                }
            });
            
            return model;
        } catch(error) {
            if(error instanceof ApiError) throw error
            throw new ApiError('ِAdd model failed', INTERNAL_SERVER_ERROR)
        }
    }

    async updateModel({ modelId, data }: { modelId: string, data: Partial<ICreateModelData> }) {
        try {
            return await this.modelDataSource.updateOne({ _id: modelId }, data);
        } catch(error) {
            if(error instanceof ApiError) throw error
            throw new ApiError('Updated model failed', INTERNAL_SERVER_ERROR)
        }
    }

    async deleteModel({ modelId }: { modelId: string }) {
        try {

            const deletedModel = await this.modelDataSource.deleteOne({ _id: modelId });
            
            if(!deletedModel) {
                throw new ApiError('Deleted model failed', INTERNAL_SERVER_ERROR)
            }
            
            // Deleted rpms related with this model And Points
            await Promise.all([
                Point.deleteMany({ modelId }),
                RPM.deleteMany({ modelId })
            ])

            return true;

        } catch(error) {
            if(error instanceof ApiError) throw error
            throw new ApiError('Deleted model failed', INTERNAL_SERVER_ERROR)
        }
    }

    async getAllModels({ type }: { type?: ModelTypesEnum }) {
        try {

            let query: any = {};
            if(type) query.type = type;
            
            return await this.modelDataSource.find(query);

        } catch(error) {
            if(error instanceof ApiError) throw error
            throw new ApiError('Deleted model failed', INTERNAL_SERVER_ERROR)
        }
    }
}

export const modelService = new ModelService()
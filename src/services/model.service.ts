import { ICreateModelData, ModelTypesEnum } from "../interfaces";
import { modelRepository } from "../repositories";
import { ApiError, INTERNAL_SERVER_ERROR, NOT_FOUND } from "../utils";

class ModelService {
    constructor(private readonly modelDataSource = modelRepository){}

    async isModelExists(modelId: string) {
        const model = await this.modelDataSource.findOne({ _id: modelId });
        if(!model) {
            throw new ApiError('Model not found', NOT_FOUND) 
        }
        return model;
    }

    async addModel(data: ICreateModelData) {
        try {
            return await this.modelDataSource.createOne(data);
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

            // Deleted rpms related with this model
            // Delete poinsts related with this model
            return deletedModel; 
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
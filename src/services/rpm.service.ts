import { ICreateRPMData } from "../interfaces";
import { rpmRepository } from "../repositories";
import { ApiError, INTERNAL_SERVER_ERROR, NOT_FOUND } from "../utils";

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

}

export const rpmService = new RPMService()
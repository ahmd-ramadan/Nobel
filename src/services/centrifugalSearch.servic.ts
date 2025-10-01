import {AxialOptionsEnum, CentrifugalTypesEnum, ConfigurationTypesEnum, IRPM, ISearchInput, ISearchResult, ModelTypesEnum, PressureTypesEnum } from "../interfaces";
import { Model } from "../models";
import { ApiError, INTERNAL_SERVER_ERROR } from "../utils";
import { searchService } from "./search.service";
class CentrifugalSearchService { 
  
    constructor() {}

    /* Steps
        1. get all models in centrifugalModelType
        2. get all rpms in centrifugalModelOption
        3. get all rpms for model
        4. get best point for each model and retuened data use promise to make it sequantily
    */ 
    async centrifugalSearch(searchInputs: ISearchInput): Promise<ISearchResult[]> {
        try {
            const { staticPressure, flowRate, axialOption, centrifugalType, configurationType, pressureType } = searchInputs;
            
            // Force refresh connection to get latest data
            await searchService.forceRefreshConnection();
            
            const models: any[] = await this.fetchModelsByTypes({ centrifugalType: centrifugalType!, configurationType, pressureType: pressureType! });
            // const modelsIds: string[] = models.map(m => m._id.toString());

            const rpms: IRPM[] = await searchService.fetchRpmsByOptionAndModels({ axialOption: axialOption as AxialOptionsEnum, modelsIds: [] });
            const rpmsMap = new Map<string, any[]>;
            rpms.forEach(r => {
                const key = r.modelId.toString();
                if (!rpmsMap.has(key)) {
                    rpmsMap.set(key, []);
                }
                rpmsMap.get(key)!.push(r);
            });

            // console.log("models length: ", models.length, "\t rpms length: ", rpms.length)
            // console.log("models: ", models, '\n')
            // console.log("modelsIds: ", modelsIds, '\n')

            const resultsPromises = models.map(model => {
                const rpms = rpmsMap.get(model._id.toString()) || [];
                return searchService.findClosestPoint({
                    model,
                    rpms,
                    flowRate,
                    staticPressure
                });
            });

            const results = await Promise.all(resultsPromises)
            // const generatedResponse = results
            //   .filter(r => { r !== null })
            //   .map(r => ({ 
            //     result: r,
            //     rpm: rpms.find(rpm => rpm._id === r.rpmId)!,
            //     model: models.find(model => model._id === r.modelId)!,
            //     // points: await Point.find({ rpmId: r.rpmId }).select("-rpmId modelId").lean()
            // }))
            // return generatedResponse;
            return results.filter(r => r !== null);
          } catch(err) {
            console.log(err);
            if(err instanceof ApiError) throw err;
            throw new ApiError('centrifugal فشل عملية البحث', INTERNAL_SERVER_ERROR) 
        }
    }

    async fetchModelsByTypes({ centrifugalType, configurationType, pressureType }: { centrifugalType: CentrifugalTypesEnum, configurationType?: ConfigurationTypesEnum, pressureType: PressureTypesEnum }) {
        try {
            const modelsTypesQuery: any = { 
                type: ModelTypesEnum.CENTRIFUGAL,
                centrifugalType, 
                pressureType 
            };
            if(configurationType) modelsTypesQuery.configurationType = configurationType;
            
            // console.log(centrifugalType, configurationType, pressureType);
            const models = await Model.find(modelsTypesQuery).lean()
            
            return models;
        } catch(err) {
            console.log(err);
            if(err instanceof ApiError) throw err;
            throw new ApiError('centrifugal فشل عملية البحث', INTERNAL_SERVER_ERROR) 
        }
    }
}

export const centrifugalSearchService = new CentrifugalSearchService()


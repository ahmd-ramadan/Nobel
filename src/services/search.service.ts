import { FlowRateUnitsEnum, ISearchInput, ModelTypesEnum, StaticPressureUnitsEnum } from "../interfaces";
import { ApiError, INTERNAL_SERVER_ERROR } from "../utils";
import { AxialSearchService } from "./axialSearch.service";

class SearchService extends AxialSearchService {

    constructor(){
      super()
    }

    async search(searchInputs: ISearchInput) {
        try {

            const { 
              flowRate, flowRateUnit, 
              staticPressure, staticPressureUnit, 
              modelType 
            } = searchInputs;
            
            const newFlowRate = this.convertFlowRateUnits({ flowRate, flowRateUnit }); 
            const newStaticPressure = this.convertStaticPressureUnits({ staticPressure, staticPressureUnit }); 

            const newSearchInputs: ISearchInput = { ... searchInputs,  flowRate: newFlowRate, staticPressure: newStaticPressure }

            let results: any[] = [];
            if(modelType === ModelTypesEnum.AXIAL) {
                results = await this.axialSearchNew(newSearchInputs);
            } else {
                results = []
            }
            
            return results;

        } catch(err) {
            console.log(err);
            if(err instanceof ApiError) throw err;
            throw new ApiError('فشل عملية البحث', INTERNAL_SERVER_ERROR) 
        }
    }

    private convertFlowRateUnits({ flowRate, flowRateUnit }: { flowRate: number, flowRateUnit: FlowRateUnitsEnum }): number {
      switch(flowRateUnit) {
        case FlowRateUnitsEnum.M3S:
          return flowRate
        case FlowRateUnitsEnum.M3H:
          return flowRate * 3600
        case FlowRateUnitsEnum.LS:
          return flowRate * 1000
        case FlowRateUnitsEnum.CFM:
          return flowRate * 1.7
        default:
          return flowRate; 
      } 
    }

    private convertStaticPressureUnits({ staticPressure, staticPressureUnit }: { staticPressure: number, staticPressureUnit: StaticPressureUnitsEnum }): number {
      switch(staticPressureUnit) {
        case StaticPressureUnitsEnum.PA:
          return staticPressure
        case StaticPressureUnitsEnum.INWC:
          return staticPressure / 250
        case StaticPressureUnitsEnum.KPA:
          return staticPressure / 1000
        case StaticPressureUnitsEnum.BAR:
          return staticPressure / 100000
        default:
          return staticPressure
      }
    }
}

export const searchService = new SearchService()


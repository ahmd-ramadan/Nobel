import mongoose from "mongoose";
import { MongoClient, Db } from 'mongodb';

import { mongodbUrl } from "../config";
import { AxialOptionsEnum, AxialRPMsBasedOnOption, FlowRateUnitsEnum, IModelModel, ISearchInput, ISearchResult, ModelTypesEnum, StaticPressureUnitsEnum } from "../interfaces";
import { ApiError, INTERNAL_SERVER_ERROR } from "../utils";
import { axialSearchService } from "./axialSearch.service";
import { centrifugalSearchService } from "./centrifugalSearch.servic";
import { rpmRepository } from "../repositories";


class SearchService {

    private client: MongoClient;
    private db!: Db;

    constructor(){
        this.client = new MongoClient(mongodbUrl, {
            // Optimized for heavy operations
            maxPoolSize: 100,
            minPoolSize: 20,
            connectTimeoutMS: 60000,
            socketTimeoutMS: 60000,
            serverSelectionTimeoutMS: 60000,
            retryWrites: true,
            w: 'majority', // Ensure writes are acknowledged by majority
            journal: true,
            readConcern: { level: 'majority' }, // Read from majority
            writeConcern: { w: 'majority', j: true }, // Write with journal
            readPreference: 'primary' // Always read from primary to avoid stale data
        });
    }

    async connect() {
        if (!this.db) {
            await this.client.connect();
            this.db = this.client.db();
            
            // Set read preference to primary to avoid stale reads
            // this.db.readPreference = 'primary'; // This is read-only, handled in connection options
            console.log('✅ Native MongoDB driver connected');
        }
    }

    async forceRefreshConnection() {
        try {
            // Force Mongoose to refresh connection and clear any caches
            const mongoose = require('mongoose');
            if (mongoose.connection.readyState === 1) {
                await mongoose.connection.db.admin().ping();
                
                // Force collection refresh
                await mongoose.connection.db.collection('points').findOne({});
                await mongoose.connection.db.collection('rpms').findOne({});
                await mongoose.connection.db.collection('models').findOne({});
            }
        } catch (error) {
            console.log('Connection refresh failed:', error);
        }
    }
    
    async search(searchInputs: ISearchInput) {
        try {
            await this.connect();

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
                results = await axialSearchService.axialSearch(newSearchInputs);
            } else {
                results = await centrifugalSearchService.centrifugalSearch(newSearchInputs);
            }
            
            return results;

        } catch(err) {
            console.log(err);
            if(err instanceof ApiError) throw err;
            throw new ApiError('فشل عملية البحث', INTERNAL_SERVER_ERROR) 
        }
    }

    async fetchRpmsByOptionAndModels({ axialOption, modelsIds }: { axialOption: AxialOptionsEnum, modelsIds: string[] }) {
        try {
            const ranges = AxialRPMsBasedOnOption[axialOption]
            .split('/')
            .map(r => {
                const [start, end] = r.split('-').map(Number);
                return { start, end };
            });
        
            const conditions = ranges.map(r => ({
                rpm: { $gte: r.start, $lte: r.end }
            }));
        
            // Query واحد بكل الـ ranges
            const rpms = await rpmRepository.find({
                $or: conditions,
                // ...(modelsIds.length ? { modelId: { $in: modelsIds } } : {})
            }); // Repository doesn't support lean(), but we'll use readConcern
    
            return rpms;
        } catch(err) {
            console.log(err);
            throw new ApiError(' فشل عملية البحث', INTERNAL_SERVER_ERROR);
        }
    }

    convertFlowRateUnits({ flowRate, flowRateUnit }: { flowRate: number, flowRateUnit: FlowRateUnitsEnum }): number {
      switch(flowRateUnit) {
        case FlowRateUnitsEnum.M3S:
          return flowRate
        case FlowRateUnitsEnum.M3H:
          return flowRate / 3600
        case FlowRateUnitsEnum.LS:
          return flowRate / 1000
        case FlowRateUnitsEnum.CFM:
          return flowRate / 2117.647
        default:
          return flowRate; 
      } 
    }

    convertStaticPressureUnits({ staticPressure, staticPressureUnit }: { staticPressure: number, staticPressureUnit: StaticPressureUnitsEnum }): number {
      switch(staticPressureUnit) {
        case StaticPressureUnitsEnum.PA:
          return staticPressure
        case StaticPressureUnitsEnum.INWC:
          return staticPressure * 250
        case StaticPressureUnitsEnum.KPA:
          return staticPressure * 1000
        case StaticPressureUnitsEnum.BAR:
          return staticPressure * 100000
        default:
          return staticPressure
      }
    }

    async findClosestPoint(
        { model, rpms, flowRate, staticPressure }: 
        { model: IModelModel, rpms: any[], flowRate: number, staticPressure: number }
    ): Promise<ISearchResult | null> {
        try {
            const diameter = model.factor / 1000.000000;
    
            // Calculate dynamic & target pressure
            const q = flowRate;
            const velocity = (4 * q) / (Math.PI * Math.pow(diameter, 2));
            const dynamicPressure = 0.5 * 1.2 * Math.pow(velocity, 2);
            const targetTotalPressure = staticPressure + dynamicPressure;
        
            const rpmsIds = rpms.map(r => r._id.toString());
    
            // console.log("dynamicPressure: ", dynamicPressure, "\ttargetTotalPressure: ", targetTotalPressure, "\tdiameter: ", diameter, "\n", model)
            
            // Debug: Check if points exist for this RPM
            const debugCount = await this.db.collection('points').countDocuments({ 
            rpmId: { $in: rpmsIds.map(id => new mongoose.Types.ObjectId(id)) } 
            });
            console.log(`🔍 Debug: Found ${debugCount} points for RPMs: ${rpmsIds.slice(0, 3).join(', ')}...`);
            
            const results = await this.db.collection('points').aggregate([
            {
                $match: {
                rpmId: { $in: rpmsIds.map(id => new mongoose.Types.ObjectId(id)) }, // => new mongoose.Types.ObjectId(id)) }, 
                flowRate: { $gte: flowRate * 0.9, $lte: flowRate * 1.1 },
                totalPressure: { $gte: targetTotalPressure * 0.9, $lte: targetTotalPressure * 1.1 }
                }
            },
            {
                $addFields: {
                flowRateError: {
                    $multiply: [
                    {
                        $divide: [
                        { $abs: { $subtract: ["$flowRate", flowRate] } },
                        flowRate
                        ]
                    },
                    100
                    ]
                },
                totalPressureError: {
                    $multiply: [
                    {
                        $divide: [
                        { $abs: { $subtract: ["$totalPressure", targetTotalPressure] } },
                        targetTotalPressure
                        ]
                    },
                    100
                    ]
                }
                }
            },
            {
                $addFields: {
                averageError: {
                    $divide: [{ $add: ["$flowRateError", "$totalPressureError"] }, 2]
                },
                errorDiff: {
                    $abs: { $subtract: ["$flowRateError", "$totalPressureError"] }
                }
                }
            },
            {
                $match: { averageError: { $lte: 0.5 } } 
            },
            {
                $sort: { averageError: 1, errorDiff: 1 } // sort by best match
            },
            {
                $limit: 1 // best point across all candidates
            }
            ], {
            readConcern: { level: 'majority' },
            allowDiskUse: true
            })
            .toArray()
            // .explain("executionStats"); 
    
            console.log(results.length);
            // console.log(rpms)
    
            const bestPoint = results.length ? { ... results[0], dynamicPressure, totalPressure: targetTotalPressure } as any : null;
            if(bestPoint) {
            return await this.generateSearchAxialResponse({ 
                result: bestPoint,
                model: model,
                rpm: rpms.find(r => r._id.toString() === bestPoint?.rpmId.toString())
            })
            } else {
            return null;
            }
        } catch(err) {
            console.log(err);
            if(err instanceof ApiError) throw err;
            throw new ApiError("Find closest point failed", INTERNAL_SERVER_ERROR)
        }
    }
    
    async generateSearchAxialResponse({ result, model, rpm }: { result: any, model: IModelModel, rpm: any }): Promise<ISearchResult> {

        // console.log(result, model, rpm)
        // const points = await this.db.collection('points').aggregate([
        //   {
        //     $match: {
        //       rpmId: rpm._id
        //     }
        //   },
        //   { 
        //     $addFields: {
        //       power:  { $multiply: ["$brakePower", 1.15] }
        //     }
        //   },
        //   {
        //     $limit: 1000
        //   }
        // ], {
        //   readConcern: { level: 'majority' },
        //   allowDiskUse: true
        // }).toArray() as any;
        
    
        // console.log(points.length);
        // console.log({ rpmId: rpm.id }, { modelId: - 1, rpmId: -1 });

        return { 
            model: { name: model.name, _id: model._id }, 
            rpm: { rpm: rpm.rpm, _id: rpm._id },
            // points, 
            closestPoint: result 
        };
    }  
}

export const searchService = new SearchService()


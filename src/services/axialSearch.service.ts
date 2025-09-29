import { AxialModelsAndOptionsBasedOnType, AxialOptionsEnum, AxialRPMsBasedOnOption, AxialTypesEnum, IModelModel, IRPM, ISearchInput, ISearchResult, ModelTypesEnum } from "../interfaces";
import { Model, Point } from "../models";
import { ApiError, INTERNAL_SERVER_ERROR } from "../utils";
import { rpmRepository } from "../repositories";
import { mongodbUrl } from "../config";
import { MongoClient, Db, ObjectId } from 'mongodb';
import mongoose from "mongoose";

class AxialSearchService {

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

    private async forceRefreshConnection() {
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
    
    /* Steps
      1. get all models in axialModelType
      2. get all rpms in axialModelOption
      3. get all rpms for model
      4. get best point for each model and retuened data use promise to make it sequantily
    */ 
    protected async axialSearchNew(searchInputs: ISearchInput): Promise<ISearchResult[]> {
        try {
            const { staticPressure, flowRate, axialOption, axialType } = searchInputs;
            
            // Force refresh connection to get latest data
            await this.forceRefreshConnection();
            
            const models: any[] = await this.fetchModelsByType({ axialType: axialType as AxialTypesEnum});
            // const modelsIds: string[] = models.map(m => m._id.toString());

            const rpms: IRPM[] = await this.fetchRpmsByOptionAndModels({ axialOption: axialOption as AxialOptionsEnum, modelsIds: [] });
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
              return this.findClosestPoint({
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
            throw new ApiError('axial فشل عملية البحث', INTERNAL_SERVER_ERROR) 
        }
    }
    private async fetchModelsByType({ axialType }: { axialType: AxialTypesEnum }) {
        try {
            const modelsTypeRange = AxialModelsAndOptionsBasedOnType[axialType].split('-');
            const startModel = parseInt(modelsTypeRange[0]);
            const endModel = parseInt(modelsTypeRange[1]);
            
            // console.log(modelsTypeRange, startModel, endModel);
            const models = await Model.find({
                type: ModelTypesEnum.AXIAL,
                factor: { $gte: startModel, $lte: endModel }
            }).lean() // Use lean() to bypass Mongoose caching
            
            return models;
        } catch(err) {
            console.log(err);
            if(err instanceof ApiError) throw err;
            throw new ApiError('axial فشل عملية البحث', INTERNAL_SERVER_ERROR) 
        }
    }
    private async fetchRpmsByOptionAndModels({ axialOption, modelsIds }: { axialOption: AxialOptionsEnum, modelsIds: string[] }) {
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
        throw new ApiError('axial فشل عملية البحث', INTERNAL_SERVER_ERROR);
      }
    }
    private async findClosestPoint(
      { model, rpms, flowRate, staticPressure }: 
      { model: IModelModel, rpms: any[], flowRate: number, staticPressure: number }): Promise<ISearchResult | null> {
      const diameter = model.factor / 1000.000000;

      // Calculate dynamic & target pressure
      const q = flowRate;
      const velocity = (4 * q) / (Math.PI * Math.pow(diameter, 2));
      const dynamicPressure = 0.5 * 1.2 * Math.pow(velocity, 2);
      const targetTotalPressure = staticPressure + dynamicPressure;
    
      const rpmsIds = rpms.map(r => r._id.toString());

      // console.log("dynamicPressure: ", dynamicPressure, "\ttargetTotalPressure: ", targetTotalPressure, "\tdiameter: ", diameter, "\n", model)
      
      // Use native MongoDB driver for aggregation
      await this.connect();
      
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
      }).toArray()

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

    }
    private async generateSearchAxialResponse({ result, model, rpm }: { result: any, model: IModelModel, rpm: any }): Promise<ISearchResult> {
      // Use native MongoDB driver for aggregation
      await this.connect();

      console.log(result, model, rpm)
      const points = await this.db.collection('points').aggregate([
        {
          $match: {
            rpmId: rpm._id
          }
        },
        { 
          $addFields: {
            power:  { $multiply: ["$brakePower", 1.15] }
          }
        },
        {
          $limit: 1000
        }
      ], {
        readConcern: { level: 'majority' },
        allowDiskUse: true
      }).toArray() as any;
      
    
      // console.log(points.length);
      // console.log({ rpmId: rpm.id }, { modelId: - 1, rpmId: -1 });

      return { 
        model: { name: model.name, _id: model._id }, 
        rpm: { rpm: rpm.rpm, _id: rpm._id },
        points, 
        closestPoint: result 
      };
    }  
}

export { AxialSearchService }
export const axialSearchService = new AxialSearchService()


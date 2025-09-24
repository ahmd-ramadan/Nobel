import { MongoClient, Db, ObjectId } from 'mongodb';
import { ICreateModelData, ICreatePointsData, IModel, IModelModel, IPointData } from "../interfaces";
import { ApiError, CONFLICT, INTERNAL_SERVER_ERROR, NOT_FOUND, } from "../utils";
import { calculateDiameter, calculateFirstRpm, handleGenerateNextRpm } from "../utils/points.utils";
import { mongodbUrl } from "../config";
import { ValidationErrorMessages } from '../constants/error.messages';
import { Model } from '../models'

class NativeModelService {
    private client: MongoClient;

    private db!: Db;

    constructor() {
        this.client = new MongoClient(mongodbUrl, {
            // Optimized for heavy operations
            maxPoolSize: 100,
            minPoolSize: 20,
            connectTimeoutMS: 60000,
            socketTimeoutMS: 60000,
            serverSelectionTimeoutMS: 60000,
            retryWrites: true,
            w: 1,
            journal: true
        });
    }

    async connect() {
        if (!this.db) {
            await this.client.connect();
            this.db = this.client.db();
            console.log('✅ Native MongoDB driver connected');
        }
    }

    async disconnect() {
        if (this.client) {
            await this.client.close();
            console.log('✅ Native MongoDB driver disconnected');
        }
    }

    async isModelExistsByName(modelName: string) {
        await this.connect();
        return await this.db.collection('models').findOne({ name: modelName });
    }

    async addModel(data: ICreateModelData) {
        try {
            await this.connect();
            
            // Check if model exists
            const isModelExist = await this.isModelExistsByName(data.name);
            if (isModelExist) {
                throw new ApiError(ValidationErrorMessages.MODEL_EXIST, CONFLICT)
            }
            // Check if any model in process wait some time
            const areAnotherModelsInProssess = await Model.find({ isComplete: false });
            if (areAnotherModelsInProssess.length > 0) {
                throw new ApiError(ValidationErrorMessages.ADD_MODEL_FAILED2, CONFLICT)
            }

            // Insert model
            const result = await this.db.collection('models').insertOne({ ...data, isComplete: true });
            const model: IModel = { 
                ...data, 
                isComplete: true,
                _id: result.insertedId.toString(),
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // Start background processing
            // process.nextTick(async () => {
                try {
                    console.log(`🚀 Starting native processing for model: ${model.name} (RPMs ${model.startRpmNumber}-${model.endRpmNumber})`);
                    
                    await this.addRPMWithPoints(model);
                    // if(isOk === true) await Model.findOneAndUpdate({ _id: result.insertedId }, { isComplete: true })
                    
                    console.log(`\n💯 Successfully completed native processing for model: ${model.name} 💯`);
                    
                } catch (error) {
                    throw new ApiError(`❌ Error in native background processing for model ${model.name}:`, INTERNAL_SERVER_ERROR);
                }
            // });

            return model;
        } catch (error) {
            console.log(error)
            throw new ApiError('Add model failed', INTERNAL_SERVER_ERROR);
        }
    }

    async addRPMWithPoints(model: IModel) {
        try {
            const { _id: modelId, startRpmNumber, endRpmNumber, factor } = model;

            console.log(model);

            // Calculate diameter for this model
            const diameter = calculateDiameter(factor);

            const firstRpmPoints = await this.generateFirstRpmPoints({ model, diameter });

            // Process remaining RPMs in batches
            const batchSize = 10; // Can be larger with native driver
            
            // for (let batchStart = startRpmNumber + 1; batchStart <= endRpmNumber; batchStart += batchSize) {
            //     const batchEnd = Math.min(batchStart + batchSize - 1, endRpmNumber);
                
            //     console.log(`Processing RPMs ${batchStart} to ${batchEnd}...`);
                
            //     // Create RPMs for this batch
            //     const rpmOperations = [];
            //     for (let rpm = batchStart; rpm <= batchEnd; rpm++) {
            //         rpmOperations.push({
            //             insertOne: {
            //                 document: { modelId, rpm }
            //             }
            //         });
            //     }
                
            //     const rpmResults = await this.db.collection('rpms').bulkWrite(rpmOperations);
                
            //     // Generate and insert points for this batch
            //     const pointOperations: any[] = [];
            //     let rpmIndex = 0;
                
            //     for (let rpm = batchStart; rpm <= batchEnd; rpm++) {
            //         const rpmId = rpmResults.insertedIds[rpmIndex];
            //         const nextRpmPoints = handleGenerateNextRpm(
            //             firstRpm.points as IPointData[], 
            //             startRpmNumber, 
            //             rpm, 
            //             diameter
            //         ) as IPointData[];
                    
            //         // Add points to batch operations
            //         nextRpmPoints.forEach(point => {
            //             pointOperations.push({
            //                 insertOne: {
            //                     document: { modelId, rpmId, ...point }
            //                 }
            //             });
            //         });
                    
            //         rpmIndex++;
            //     }
                
            //     // Bulk insert all points for this batch
            //     if (pointOperations.length > 0) {
            //         await this.db.collection('points').bulkWrite(pointOperations);
            //         console.log(`✅ Added ${pointOperations.length} points for RPMs ${batchStart}-${batchEnd}`);
            //     }
                
            //     // Small delay between batches
            //     if (batchEnd < endRpmNumber) {
            //         await new Promise(resolve => setTimeout(resolve, 200));
            //     }
            // }

            // Add Rpms in one operations not more than 3000 rpms in one model
            // From startRpm + 1 to endRpm
           
            const allRpms = Array.from({ length: endRpmNumber - startRpmNumber }, (_, rpm) => ({ modelId, rpm: rpm + startRpmNumber + 1 }));
            // console.log("Next Generated Rpms: ", allRpms);
            const allRpmsAdded = await this.db.collection('rpms').insertMany(allRpms);
            
            console.log("Added Rpms: ", allRpmsAdded.insertedCount);

            let rpmIndex = 0;
            for (let batchStart = startRpmNumber + 1; batchStart <= endRpmNumber; batchStart += batchSize) {
                const batchEnd = Math.min(batchStart + batchSize - 1, endRpmNumber);
                
                console.log(`Processing RPMs ${batchStart} to ${batchEnd}...`);
                
                // Create RPMs for this batch
                // const rpmOperations = [];
                // for (let rpm = batchStart; rpm <= batchEnd; rpm++) {
                //     rpmOperations.push({
                //         insertOne: {
                //             document: { modelId, rpm }
                //         }
                //     });
                // }
                
                // const rpmResults = await this.db.collection('rpms').bulkWrite(rpmOperations);
                
                // Generate and insert points for this batch
                
                const pointOperations: any[] = [];
                const promisesAll = [];

                for (let rpm = batchStart; rpm <= batchEnd; rpm++) {
                    const rpmId = allRpmsAdded.insertedIds[rpmIndex].toString();
                    // console.log(rpmId)
                    const nextRpmPoints = handleGenerateNextRpm(
                        firstRpmPoints as IPointData[], // <-- use the array, not firstRpm.points
                        startRpmNumber,
                        rpm,
                        diameter
                    ) as IPointData[];
                    
                    // // Add points to batch operations
                    // nextRpmPoints.forEach(point => {
                    //     pointOperations.push({
                    //         insertOne: {
                    //             document: { modelId, rpmId, ...point }
                    //         }
                    //     });
                    // });

                    promisesAll.push(this.addAllPointsForRpm({ modelId, rpmId, points: nextRpmPoints }))
                    
                    rpmIndex++;
                }
                await Promise.all(promisesAll);
                
                // Bulk insert all points for this batch
                if (pointOperations.length > 0) {
                    // await this.db.collection('points').bulkWrite(pointOperations);
                    console.log(`✅ Added ${pointOperations.length} points for RPMs ${batchStart}-${batchEnd}`);
                }
                
                // Small delay between batches
                if (batchEnd < endRpmNumber) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }

            return true;;

        } catch (error) {
            console.error('Error in addRPMWithPoints:', error);
            if (error instanceof ApiError) throw error;
            throw new ApiError('Add RPMs With Points failed', INTERNAL_SERVER_ERROR);
        }
    }

    async generateFirstRpmPoints({ model, diameter }: { model: IModel, diameter: number }) {
        try {   
            const { _id: modelId, startRpmNumber, points } = model;
            
            // Create first RPM
            const firstRpmResult = await this.db.collection('rpms').insertOne({ 
                modelId, 
                rpm: startRpmNumber 
            });
            const firstRpm = { _id: firstRpmResult.insertedId, modelId, rpm: startRpmNumber };
            
            // Generate first rpm points
            const firstRpmPoints = calculateFirstRpm(points, startRpmNumber, diameter);

            const result = await this.addAllPointsForRpm({ 
                modelId, 
                rpmId: firstRpm._id.toString(), 
                points: firstRpmPoints as IPointData[] 
            });

            // console.log(result)
            
            return firstRpmPoints; // <-- return the points array
        } catch(err) {
            console.log(err);
            if(err instanceof ApiError) throw err
            throw new ApiError('Failed to generate and add first rpm points', INTERNAL_SERVER_ERROR)
        }
    }

    async addAllPointsForRpm(data: ICreatePointsData, retryCount = 0): Promise<any> {
        const maxRetries = 3;
        const retryDelay = 2000;
        
        try {
            const { rpmId, modelId, points } = data;
            
            // Delete existing points
            await this.db.collection('points').deleteMany({ modelId, rpmId });
            
            // Prepare documents for bulk insert
            const documents = points.map(point => ({
                modelId,
                rpmId,
                ...point
            }));
            
            // Bulk insert all points at once
            const result = await this.db.collection('points').insertMany(documents);
            
            console.log(`✅ Added ${points.length} points for RPM ${rpmId} successfully✅`);
            
            return result;
            
        } catch (error) {
            console.error(`Error adding points for RPM ${data.rpmId} (attempt ${retryCount + 1}/${maxRetries + 1}):`, error);
            
            // Retry logic for network errors
            if (error instanceof Error && (
                error.name === 'MongoNetworkTimeoutError' || 
                error.name === 'MongoNetworkError' ||
                error.message.includes('ENOTFOUND') ||
                error.message.includes('getaddrinfo')
            )) {
                if (retryCount < maxRetries) {
                    console.log(`🔄 Retrying in ${retryDelay}ms... (attempt ${retryCount + 1}/${maxRetries})`);
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                    return this.addAllPointsForRpm(data, retryCount + 1);
                } else {
                    throw new ApiError(`Database connection failed after ${maxRetries + 1} attempts for RPM ${data.rpmId}`, INTERNAL_SERVER_ERROR);
                }
            }
            
            if (error instanceof ApiError) throw error;
            throw new ApiError(`Add points data for RPM ${data.rpmId} failed: ${error instanceof Error ? error.message : 'Unknown error'}`, INTERNAL_SERVER_ERROR);
        }
    }

    async updateModel({ modelId, data }: { modelId: string, data: Partial<ICreateModelData> }) {
        try {
            await this.connect();
            // is model exist
            const isModelExist = await Model.findById(modelId);
            if(!isModelExist) {
                throw new ApiError('Model is not exist', NOT_FOUND)
            }

            console.log(data);

            // is name not exist if want update name
            if(data.name) {
                const isModelExist = await Model.findOne({ name: data.name });
                if(isModelExist) {
                    throw new ApiError('Model name is exist, can not add this name for model', NOT_FOUND)
                }
            }

            // Check if any model in process wait some time
            const areAnotherModelsInProssess = await Model.find({ isComplete: false });
            if (areAnotherModelsInProssess.length > 0) {
                throw new ApiError(ValidationErrorMessages.ADD_MODEL_FAILED2, CONFLICT)
            }

            const isUpdatedPoints = !(Object.values(data).length === 1 && data?.name);

            // Delete old rpms & points
            if (isUpdatedPoints) {
                await this.deleteModel({ modelId, deletedModel: false });
            }

            // update modelData
            const updatedModel = await Model.findByIdAndUpdate(modelId, {... data }, { new: true }) as IModelModel;

            // genereate new rpms models after response and update model isComplete
            // process.nextTick(async () => {
                try {
                    if(isUpdatedPoints) {
                        console.log(`🚀 Starting native processing for model: ${updatedModel.name} (RPMs ${updatedModel.startRpmNumber}-${updatedModel.endRpmNumber})`);
                        await this.addRPMWithPoints(updatedModel);
                    }
                    
                    console.log(`\n💯 Successfully completed native processing for model: ${updatedModel.name} 💯`);
                    
                } catch (error) {
                    throw new ApiError(`❌ Error in native background processing for model ${updatedModel.name}:`, INTERNAL_SERVER_ERROR);
                }
            // });

            return updatedModel;
        } catch(err) {
            console.log(err);
            if(err instanceof ApiError) throw err;
            throw new ApiError('Updated model failed', INTERNAL_SERVER_ERROR)
        }
    }

    async deleteModel({ modelId, deletedModel = true }: { modelId: string, deletedModel: boolean }) {
        try {
            await this.connect();

            const allRpms = await this.db.collection("rpms")
            .find({ modelId: new ObjectId(modelId) })
            .project({ _id: 1 })
            .toArray();

            let rpmsIdx = allRpms.length - 1;
            let batchSize = 10;  // 10 * 1000 = 10000
            let deletedPromises = [];

            console.log("deleted Rpms: ", allRpms.length);

            if(allRpms.length > 0) {
                do {
                    deletedPromises.push(this.db.collection("points").deleteMany({ rpmId: allRpms[rpmsIdx]._id }))

                    batchSize --;
                    rpmsIdx --;

                    if(batchSize == 0) {
                        await Promise.all(deletedPromises);
                        console.log("Deleted Ok");
                        deletedPromises = [];
                        batchSize = 10;
                    }
                } while (rpmsIdx >= 0)
            }

          
            // Delete model, RPMs
            if(deletedModel) await this.db.collection("models").deleteOne({ _id: new ObjectId(modelId) });
            const rpmResult = await this.db.collection("rpms").deleteMany({ modelId: new ObjectId(modelId) });
               
            
            // if (!modelResult.deletedCount) {
            //     throw new ApiError('Model not found', NOT_FOUND);
            // }
            
            console.log(`✅ Deleted model ${modelId} with ${rpmResult.deletedCount} RPMs`);
            return true;
            
        } catch (error) {
            console.log(error)
            if (error instanceof ApiError) throw error;
            throw new ApiError(ValidationErrorMessages.DELETE_MODEL_FAILED, INTERNAL_SERVER_ERROR);
        }
    }

    async getAllModels({ type }: { type?: any }) {
        try {
            await this.connect();
            
            let query: any = {};
            if (type) query.type = type;
            
            return await this.db.collection('models').find(query).toArray();
            
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError(ValidationErrorMessages.GET_ALL_MODEL_FAILED, INTERNAL_SERVER_ERROR);
        }
    }
}

export const nativeModelService = new NativeModelService(); 
import { MongoClient, Db, ObjectId } from 'mongodb';
import { ICreateModelData, ICreatePointsData, IModel, IModelModel, IPointData } from "../interfaces";
import { ApiError, CONFLICT, INTERNAL_SERVER_ERROR, NOT_FOUND, } from "../utils";
import { calculateDiameter, calculateFirstRpm, handleGenerateNextRpm } from "../utils/points.utils";
import { mongodbUrl } from "../config";
import { ValidationErrorMessages } from '../constants/error.messages';

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

    async disconnect() {
        if (this.client) {
            await this.client.close();
            console.log('✅ Native MongoDB driver disconnected');
        }
    }

    async isModelExistsByName(modelName: string) {
        await this.connect();
        return await this.db.collection('models').findOne({ name: modelName }, { 
            readConcern: { level: 'majority' } 
        });
    }

    async addModel(data: ICreateModelData | any) {
        try {
            await this.connect();
            
            // Check if model exists using native driver
            const isModelExist = await this.isModelExistsByName(data.name);
            if (isModelExist) {
                throw new ApiError(ValidationErrorMessages.MODEL_EXIST, CONFLICT)
            }
            
            // Check if any model in process using native driver
            const areAnotherModelsInProcess = await this.db.collection('models').findOne({ isComplete: false }, { 
                readConcern: { level: 'majority' } 
            });
            if (areAnotherModelsInProcess) {
                throw new ApiError(ValidationErrorMessages.ADD_MODEL_FAILED2, CONFLICT)
            }

            // Insert model with isComplete: false initially
            const result = await this.db.collection('models').insertOne({ 
                ...data, 
                isComplete: false,
                createdAt: data?.createdAt ?? new Date(),
                updatedAt: new Date()
            }, { 
                writeConcern: { w: 'majority', j: true } 
            });
            
            const model: IModel = { 
                ...data, 
                isComplete: false,
                _id: result.insertedId.toString(),
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // Start background processing
            process.nextTick(async () => {
                try {
                    console.log(`🚀 Starting native processing for model: ${model.name} (RPMs ${model.startRpmNumber}-${model.endRpmNumber})`);
                    
                    await this.addRPMWithPoints(model);
                    
                    // Update model to complete using native driver
                    await this.db.collection('models').updateOne(
                        { _id: result.insertedId }, 
                        { $set: { isComplete: true, updatedAt: new Date() } }
                    );
                    
                    console.log(`\n💯 Successfully completed native processing for model: ${model.name} 💯`);
                    
                } catch (error) {
                    console.error(`❌ Error in native background processing for model ${model.name}:`, error);
                    // Update model to indicate failure
                    try {
                        await this.db.collection('models').updateOne(
                            { _id: result.insertedId }, 
                            { 
                                $set: { 
                                    isComplete: false, 
                                    error: error instanceof Error ? error.message : 'Unknown error',
                                    updatedAt: new Date()
                                } 
                            }
                        );
                    } catch (updateError) {
                        console.error('Failed to update model error status:', updateError);
                    }
                }
            });

            return model;
        } catch (error) {
            console.error('Error in addModel:', error);
            if (error instanceof ApiError) throw error;
            throw new ApiError('Add model failed', INTERNAL_SERVER_ERROR);
        }
    }

    async addRPMWithPoints(model: IModel) {
        try {
            const { _id: modelId, startRpmNumber, endRpmNumber, factor } = model;

            console.log(`Processing model: ${model.name} with RPMs ${startRpmNumber}-${endRpmNumber}`);

            // Calculate diameter for this model
            const diameter = calculateDiameter(factor);

            const firstRpmPoints = await this.generateFirstRpmPoints({ model, diameter });

            // Process remaining RPMs in batches
            const batchSize = 50; // Increased for better performance with native driver
            
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
           
            const allRpms = Array.from({ length: endRpmNumber - startRpmNumber }, (_, rpm) => ({ modelId: new ObjectId(modelId), rpm: rpm + startRpmNumber + 1 }));
            
            if (allRpms.length === 0) {
                console.log("No additional RPMs to process");
                return true;
            }
            
            const allRpmsAdded = await this.db.collection('rpms').insertMany(allRpms, { 
                writeConcern: { w: 'majority', j: true } 
            });
            console.log(`Added ${allRpmsAdded.insertedCount} RPMs for model ${model.name}`);

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
                    const nextRpmPoints = handleGenerateNextRpm(
                        firstRpmPoints as IPointData[],
                        startRpmNumber,
                        rpm,
                        diameter
                    ) as IPointData[];

                    promisesAll.push(this.addAllPointsForRpm({ modelId, rpmId, points: nextRpmPoints }));
                    rpmIndex++;
                }
                
                // Process all promises for this batch
                try {
                    await Promise.all(promisesAll);
                    console.log(`✅ Completed processing RPMs ${batchStart}-${batchEnd} for model ${model.name}`);
                } catch (batchError) {
                    console.error(`❌ Error processing batch ${batchStart}-${batchEnd}:`, batchError);
                    throw batchError; // Re-throw to stop processing
                }
                
                // Small delay between batches to prevent overwhelming the database
                if (batchEnd < endRpmNumber) {
                    await new Promise(resolve => setTimeout(resolve, 50)); // Reduced delay for better performance
                }
            }

            return true;

        } catch (error) {
            console.error('Error in addRPMWithPoints:', error);
            if (error instanceof ApiError) throw error;
            throw new ApiError(`Add RPMs With Points failed: ${error instanceof Error ? error.message : 'Unknown error'}`, INTERNAL_SERVER_ERROR);
        }
    }

    async generateFirstRpmPoints({ model, diameter }: { model: IModel, diameter: number }) {
        try {   
            const { _id: modelId, startRpmNumber, points } = model;
            
            // Create first RPM
            const firstRpmResult = await this.db.collection('rpms').insertOne({ 
                modelId: new ObjectId(modelId), 
                rpm: startRpmNumber 
            }, { 
                writeConcern: { w: 'majority', j: true } 
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
            
            if (!points || points.length === 0) {
                console.log(`No points to add for RPM ${rpmId}`);
                return { insertedCount: 0 };
            }
            
            // Delete existing points
            await this.db.collection('points').deleteMany({ 
                modelId: new ObjectId(modelId), 
                rpmId: new ObjectId(rpmId) 
            });
            
            // Prepare documents for bulk insert
            const documents = points.map(point => ({
                modelId: new ObjectId(modelId),
                rpmId: new ObjectId(rpmId),
                ...point
            }));
            
            // Bulk insert all points at once
            const result = await this.db.collection('points').insertMany(documents, { 
                writeConcern: { w: 'majority', j: true } 
            });
            
            // Force refresh connection to ensure data is visible
            await this.db.admin().ping();
            
            console.log(`✅ Added ${result.insertedCount} points for RPM ${rpmId}`);
            
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
            
            // Check if model exists using native driver
            const isModelExist = await this.db.collection('models').findOne({ _id: new ObjectId(modelId) }) as IModelModel | null;
            if(!isModelExist) {
                throw new ApiError('Model is not exist', NOT_FOUND)
            }

            console.log('Updating model with data:', data);

            // Check if name exists if updating name
            if(data.name) {
                const existingModelWithName = await this.db.collection('models').findOne({ 
                    name: data.name, 
                    _id: { $ne: new ObjectId(modelId) } 
                });
                if(existingModelWithName) {
                    throw new ApiError('Model name is exist, can not add this name for model', CONFLICT)
                }
            }

            // Check if any model in process using native driver
            const areAnotherModelsInProcess = await this.db.collection('models').findOne({ 
                isComplete: false,
                _id: { $ne: new ObjectId(modelId) }
            });
            if (areAnotherModelsInProcess) {
                throw new ApiError(ValidationErrorMessages.ADD_MODEL_FAILED2, CONFLICT)
            }

            const isUpdatedPoints = !(Object.values(data).length === 1 && data?.name);

            // Delete old rpms & points if updating points
            if (isUpdatedPoints) {
                await this.deleteModel({ modelId, deletedModel: true });
            }

            // // Update model data using native driver
            // const updateResult = await this.db.collection('models').updateOne(
            //     { _id: new ObjectId(modelId) },
            //     { 
            //         $set: { 
            //             ...data, 
            //             updatedAt: new Date(),
            //             isComplete: isUpdatedPoints ? false : isModelExist.isComplete
            //         } 
            //     },
            //     { 
            //         writeConcern: { w: 'majority', j: true } 
            //     }
            // );

            // if (updateResult.modifiedCount === 0) {
            //     throw new ApiError('Model update failed', INTERNAL_SERVER_ERROR);
            // }

            // // Get updated model
            // const updatedModel = await this.db.collection('models').findOne({ _id: new ObjectId(modelId) });

            // if (!updatedModel) {
            //     throw new ApiError('Model not found after update', NOT_FOUND);
            // }

            // Generate new rpms models after response and update model isComplete
            // process.nextTick(async () => {
                try {
                    if(isUpdatedPoints) {
                        // console.log(`🚀 Starting native processing for model: ${isModelExist._id} (RPMs ${updatedModel.startRpmNumber}-${updatedModel.endRpmNumber})`);
                        const newModel = await this.addModel({ ... isModelExist, ... data });
                        
                        // Update model to complete using native driver
                        // await this.db.collection('models').updateOne(
                        //     { _id: new ObjectId(modelId) },
                        //     { $set: { isComplete: true, updatedAt: new Date() } }
                        // );

                        return newModel;
                    }
                    // console.log(`\n💯 Successfully completed native processing for model: ${updatedModel.name} 💯`);
                    
                } catch (error) {
                    // console.error(`❌ Error in native background processing for model ${updatedModel.name}:`, error);
                    // Update model to indicate failure
                    try {
                        await this.db.collection('models').updateOne(
                            { _id: new ObjectId(modelId) },
                            { 
                                $set: { 
                                    isComplete: false, 
                                    error: error instanceof Error ? error.message : 'Unknown error',
                                    updatedAt: new Date()
                                } 
                            }
                        );
                    } catch (updateError) {
                        console.error('Failed to update model error status:', updateError);
                    }
                }
            // });

        } catch(err) {
            console.error('Error in updateModel:', err);
            if(err instanceof ApiError) throw err;
            throw new ApiError('Updated model failed', INTERNAL_SERVER_ERROR)
        }
    }

    async deleteModel({ modelId, deletedModel = true }: { modelId: string, deletedModel: boolean }) {
        try {
            await this.connect();

            console.log(`🗑️ Starting deletion for model ${modelId}`);

            // Get all RPMs for this model
            const allRpms = await this.db.collection("rpms")
            .find({ modelId: new ObjectId(modelId) })
            .project({ _id: 1 })
            .toArray();

            console.log(`Found ${allRpms.length} RPMs to delete`);

            // Delete points in batches
            if(allRpms.length > 0) {
                const batchSize = 10;
                let deletedPromises = [];

                for (let i = 0; i < allRpms.length; i += batchSize) {
                    const batch = allRpms.slice(i, i + batchSize);
                    
                    // Delete points for this batch of RPMs
                    const rpmIds = batch.map(rpm => rpm._id);
                    deletedPromises.push(
                        this.db.collection("points").deleteMany({ 
                            rpmId: { $in: rpmIds },
                            modelId: new ObjectId(modelId)
                        })
                    );

                    // Process batch when it reaches batchSize or is the last batch
                    if (deletedPromises.length >= batchSize || i + batchSize >= allRpms.length) {
                        try {
                            const results = await Promise.all(deletedPromises);
                            const totalDeleted = results.reduce((sum, result) => sum + result.deletedCount, 0);
                            console.log(`✅ Deleted ${totalDeleted} points for batch ${Math.floor(i/batchSize) + 1}`);
                        } catch (batchError) {
                            console.error(`❌ Error deleting points for batch:`, batchError);
                        }
                        deletedPromises = [];
                    }
                }
            }

            // Delete RPMs
            const rpmResult = await this.db.collection("rpms").deleteMany({ 
                modelId: new ObjectId(modelId) 
            }, { 
                writeConcern: { w: 'majority', j: true } 
            });
            console.log(`✅ Deleted ${rpmResult.deletedCount} RPMs`);

            // Delete model if requested
            if(deletedModel) {
                const modelResult = await this.db.collection("models").deleteOne({ 
                    _id: new ObjectId(modelId) 
                }, { 
                    writeConcern: { w: 'majority', j: true } 
                });
                
                if (modelResult.deletedCount === 0) {
                    throw new ApiError('Model not found', NOT_FOUND);
                }
                console.log(`✅ Deleted model ${modelId}`);
            }
            
            console.log(`✅ Successfully completed deletion for model ${modelId}`);
            return true;
            
        } catch (error) {
            console.error('Error in deleteModel:', error);
            if (error instanceof ApiError) throw error;
            throw new ApiError(ValidationErrorMessages.DELETE_MODEL_FAILED, INTERNAL_SERVER_ERROR);
        }
    }

    async getAllModels({ type }: { type?: any }) {
        try {
            await this.connect();
            
            let query: any = {};
            if (type) query.type = type;
            
            return await this.db.collection('models').find(query).sort({ createdAt: 1 }).toArray();
            
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError(ValidationErrorMessages.GET_ALL_MODEL_FAILED, INTERNAL_SERVER_ERROR);
        }
    }
}

export const nativeModelService = new NativeModelService(); 
import { ICreateModelData, ICreatePointsData, IModel, IModelModel, IPointData } from "../interfaces";
import { ApiError, CONFLICT, INTERNAL_SERVER_ERROR, NOT_FOUND, } from "../utils";
import { calculateDiameter, calculateFirstRpm, handleGenerateNextRpm } from "../utils/points.utils";
import { ValidationErrorMessages } from '../constants/error.messages';
import { Model } from '../models';
import { RPM } from '../models';
import { Point } from '../models';

class NativeModelService {
    constructor() {}

    async isModelExistsByName(modelName: string) {
        return await Model.findOne({ name: modelName });
    }

    async addModel(data: ICreateModelData) {
        try {
            // Check if model exists
            const isModelExist = await this.isModelExistsByName(data.name);
            if (isModelExist) {
                throw new ApiError(ValidationErrorMessages.MODEL_EXIST, CONFLICT)
            }
            
            // Check if any model in process
            const areAnotherModelsInProcess = await Model.findOne({ isComplete: false });
            if (areAnotherModelsInProcess) {
                throw new ApiError(ValidationErrorMessages.ADD_MODEL_FAILED2, CONFLICT)
            }

            // Create model with isComplete: false initially
            const model = new Model({ 
                ...data, 
                isComplete: false
            });
            
            await model.save();

            // Start background processing
            process.nextTick(async () => {
                try {
                    console.log(`🚀 Starting Mongoose processing for model: ${model.name} (RPMs ${model.startRpmNumber}-${model.endRpmNumber})`);
                    
                    await this.addRPMWithPoints(model);
                    
                    // Update model to complete
                    await Model.findByIdAndUpdate(model._id, { 
                        isComplete: true 
                    });
                    
                    console.log(`\n💯 Successfully completed Mongoose processing for model: ${model.name} 💯`);
                    
                } catch (error) {
                    console.error(`❌ Error in Mongoose background processing for model ${model.name}:`, error);
                    // Update model to indicate failure
                    try {
                        await Model.findByIdAndUpdate(model._id, { 
                            isComplete: false, 
                            error: error instanceof Error ? error.message : 'Unknown error'
                        });
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
            const batchSize = 20; // Optimized for Mongoose performance
            
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

            // Add Rpms in batches for better Mongoose performance
            const totalRpms = endRpmNumber - startRpmNumber;
            
            if (totalRpms === 0) {
                console.log("No additional RPMs to process");
                return true;
            }
            
            // Create RPMs in batches
            const rpmPromises = [];
            for (let rpm = startRpmNumber + 1; rpm <= endRpmNumber; rpm++) {
                rpmPromises.push(new RPM({ modelId, rpm }).save());
            }
            
            await Promise.all(rpmPromises);
            console.log(`Added ${totalRpms} RPMs for model ${model.name}`);

            // Process points for each RPM in batches
            for (let batchStart = startRpmNumber + 1; batchStart <= endRpmNumber; batchStart += batchSize) {
                const batchEnd = Math.min(batchStart + batchSize - 1, endRpmNumber);
                
                console.log(`Processing RPMs ${batchStart} to ${batchEnd}...`);
                
                const batchPromises = [];
                
                for (let rpm = batchStart; rpm <= batchEnd; rpm++) {
                    // Find the RPM document
                    const rpmDoc = await RPM.findOne({ modelId, rpm });
                    if (!rpmDoc) {
                        console.error(`RPM ${rpm} not found for model ${modelId}`);
                        continue;
                    }
                    
                    const nextRpmPoints = handleGenerateNextRpm(
                        firstRpmPoints as IPointData[],
                        startRpmNumber,
                        rpm,
                        diameter
                    ) as IPointData[];

                    batchPromises.push(this.addAllPointsForRpm({ 
                        modelId, 
                        rpmId: rpmDoc._id.toString(), 
                        points: nextRpmPoints 
                    }));
                }
                
                // Process all promises for this batch
                try {
                    await Promise.all(batchPromises);
                    console.log(`✅ Completed processing RPMs ${batchStart}-${batchEnd} for model ${model.name}`);
                } catch (batchError) {
                    console.error(`❌ Error processing batch ${batchStart}-${batchEnd}:`, batchError);
                    throw batchError; // Re-throw to stop processing
                }
                
                // Small delay between batches to prevent overwhelming the database
                if (batchEnd < endRpmNumber) {
                    await new Promise(resolve => setTimeout(resolve, 100)); // Slightly longer delay for Mongoose
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
            const firstRpm = new RPM({ 
                modelId, 
                rpm: startRpmNumber 
            });
            await firstRpm.save();
            
            // Generate first rpm points
            const firstRpmPoints = calculateFirstRpm(points, startRpmNumber, diameter);

            await this.addAllPointsForRpm({ 
                modelId, 
                rpmId: firstRpm._id.toString(), 
                points: firstRpmPoints as IPointData[] 
            });
            
            return firstRpmPoints;
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
            await Point.deleteMany({ modelId, rpmId });
            
            // Prepare documents for bulk insert
            const documents = points.map(point => ({
                modelId,
                rpmId,
                ...point
            }));
            
            // Bulk insert all points at once using Mongoose
            const result = await Point.insertMany(documents);
            
            console.log(`✅ Added ${result.length} points for RPM ${rpmId}`);
            
            return { insertedCount: result.length };
            
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
            // Check if model exists
            const isModelExist = await Model.findById(modelId);
            if(!isModelExist) {
                throw new ApiError('Model is not exist', NOT_FOUND)
            }

            console.log('Updating model with data:', data);

            // Check if name exists if updating name
            if(data.name) {
                const existingModelWithName = await Model.findOne({ 
                    name: data.name, 
                    _id: { $ne: modelId } 
                });
                if(existingModelWithName) {
                    throw new ApiError('Model name is exist, can not add this name for model', CONFLICT)
                }
            }

            // Check if any model in process
            const areAnotherModelsInProcess = await Model.findOne({ 
                isComplete: false,
                _id: { $ne: modelId }
            });
            if (areAnotherModelsInProcess) {
                throw new ApiError(ValidationErrorMessages.ADD_MODEL_FAILED2, CONFLICT)
            }

            const isUpdatedPoints = !(Object.values(data).length === 1 && data?.name);

            // Delete old rpms & points if updating points
            if (isUpdatedPoints) {
                await this.deleteModel({ modelId, deletedModel: false });
            }

            // Update model data using Mongoose
            const updatedModel = await Model.findByIdAndUpdate(
                modelId,
                { 
                    ...data, 
                    isComplete: isUpdatedPoints ? false : isModelExist.isComplete
                },
                { new: true }
            );

            if (!updatedModel) {
                throw new ApiError('Model update failed', INTERNAL_SERVER_ERROR);
            }

            // Generate new rpms models after response and update model isComplete
            process.nextTick(async () => {
                try {
                    if(isUpdatedPoints) {
                        console.log(`🚀 Starting Mongoose processing for model: ${updatedModel.name} (RPMs ${updatedModel.startRpmNumber}-${updatedModel.endRpmNumber})`);
                        await this.addRPMWithPoints(updatedModel as IModel);
                        
                        // Update model to complete
                        await Model.findByIdAndUpdate(modelId, { isComplete: true });
                    }
                    
                    console.log(`\n💯 Successfully completed Mongoose processing for model: ${updatedModel.name} 💯`);
                    
                } catch (error) {
                    console.error(`❌ Error in Mongoose background processing for model ${updatedModel.name}:`, error);
                    // Update model to indicate failure
                    try {
                        await Model.findByIdAndUpdate(modelId, { 
                            isComplete: false, 
                            error: error instanceof Error ? error.message : 'Unknown error'
                        });
                    } catch (updateError) {
                        console.error('Failed to update model error status:', updateError);
                    }
                }
            });

            return updatedModel;
        } catch(err) {
            console.error('Error in updateModel:', err);
            if(err instanceof ApiError) throw err;
            throw new ApiError('Updated model failed', INTERNAL_SERVER_ERROR)
        }
    }

    async deleteModel({ modelId, deletedModel = true }: { modelId: string, deletedModel: boolean }) {
        try {
            console.log(`🗑️ Starting deletion for model ${modelId}`);

            // Get all RPMs for this model
            const allRpms = await RPM.find({ modelId }).select('_id');
            console.log(`Found ${allRpms.length} RPMs to delete`);

            // Delete points in batches
            if(allRpms.length > 0) {
                const batchSize = 50; // Larger batch size for Mongoose
                const rpmIds = allRpms.map(rpm => rpm._id);

                for (let i = 0; i < rpmIds.length; i += batchSize) {
                    const batch = rpmIds.slice(i, i + batchSize);
                    
                    try {
                        const result = await Point.deleteMany({ 
                            rpmId: { $in: batch },
                            modelId
                        });
                        console.log(`✅ Deleted ${result.deletedCount} points for batch ${Math.floor(i/batchSize) + 1}`);
                    } catch (batchError) {
                        console.error(`❌ Error deleting points for batch:`, batchError);
                    }
                }
            }

            // Delete RPMs
            const rpmResult = await RPM.deleteMany({ modelId });
            console.log(`✅ Deleted ${rpmResult.deletedCount} RPMs`);

            // Delete model if requested
            if(deletedModel) {
                const modelResult = await Model.findByIdAndDelete(modelId);
                
                if (!modelResult) {
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
            let query: any = {};
            if (type) query.type = type;
            
            return await Model.find(query);
            
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError(ValidationErrorMessages.GET_ALL_MODEL_FAILED, INTERNAL_SERVER_ERROR);
        }
    }
}

export const nativeModelService = new NativeModelService(); 
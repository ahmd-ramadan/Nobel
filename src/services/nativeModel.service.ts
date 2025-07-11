import { MongoClient, Db, ObjectId } from 'mongodb';
import { ICreateModelData, ICreateRPMData, ICreatePointsData, IModel, IPointData } from "../interfaces";
import { ApiError, CONFLICT, INTERNAL_SERVER_ERROR, NOT_FOUND } from "../utils";
import { calculateDiameter, calculateFirstRpm, handleGenerateNextRpm } from "../utils/points.utils";
import { mongodbUrl } from "../config";

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
                throw new ApiError("This model name is exist can't add two models with two names", CONFLICT)
            }

            // Insert model
            const result = await this.db.collection('models').insertOne(data);
            const model: IModel = { 
                ...data, 
                _id: result.insertedId.toString(),
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // Start background processing
            process.nextTick(async () => {
                try {
                    console.log(`🚀 Starting native processing for model: ${model.name} (RPMs ${model.startRpmNumber}-${model.endRpmNumber})`);
                    
                    await this.addRPMWithPoints(model);
                    
                    console.log(`\n💯 Successfully completed native processing for model: ${model.name} 💯`);
                    
                } catch (error) {
                    console.error(`❌ Error in native background processing for model ${model.name}:`, error);
                }
            });

            return model;
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError('Add model failed', INTERNAL_SERVER_ERROR);
        }
    }

    async addRPMWithPoints(model: IModel) {
        try {
            const { _id: modelId, startRpmNumber, endRpmNumber, points } = model;

            // Create first RPM
            const firstRpmResult = await this.db.collection('rpms').insertOne({ 
                modelId, 
                rpm: startRpmNumber 
            });
            const firstRpm = { _id: firstRpmResult.insertedId, modelId, rpm: startRpmNumber };

            const diameter = calculateDiameter(parseInt(model.name));
            
            // Generate first rpm points
            const firstRpmPoints = calculateFirstRpm(points, startRpmNumber, diameter);
            await this.addAllPointsForRpm({ 
                modelId, 
                rpmId: firstRpm._id.toString(), 
                points: firstRpmPoints as IPointData[] 
            });

            // Process remaining RPMs in batches
            const batchSize = 10; // Can be larger with native driver
            
            for (let batchStart = startRpmNumber + 1; batchStart <= endRpmNumber; batchStart += batchSize) {
                const batchEnd = Math.min(batchStart + batchSize - 1, endRpmNumber);
                
                console.log(`Processing RPMs ${batchStart} to ${batchEnd}...`);
                
                // Create RPMs for this batch
                const rpmOperations = [];
                for (let rpm = batchStart; rpm <= batchEnd; rpm++) {
                    rpmOperations.push({
                        insertOne: {
                            document: { modelId, rpm }
                        }
                    });
                }
                
                const rpmResults = await this.db.collection('rpms').bulkWrite(rpmOperations);
                
                // Generate and insert points for this batch
                const pointOperations: any[] = [];
                let rpmIndex = 0;
                
                for (let rpm = batchStart; rpm <= batchEnd; rpm++) {
                    const rpmId = rpmResults.insertedIds[rpmIndex];
                    const nextRpmPoints = handleGenerateNextRpm(
                        firstRpmPoints as IPointData[], 
                        startRpmNumber, 
                        rpm, 
                        diameter
                    ) as IPointData[];
                    
                    // Add points to batch operations
                    nextRpmPoints.forEach(point => {
                        pointOperations.push({
                            insertOne: {
                                document: { modelId, rpmId, ...point }
                            }
                        });
                    });
                    
                    rpmIndex++;
                }
                
                // Bulk insert all points for this batch
                if (pointOperations.length > 0) {
                    await this.db.collection('points').bulkWrite(pointOperations);
                    console.log(`✅ Added ${pointOperations.length} points for RPMs ${batchStart}-${batchEnd}`);
                }
                
                // Small delay between batches
                if (batchEnd < endRpmNumber) {
                    await new Promise(resolve => setTimeout(resolve, 200));
                }
            }

        } catch (error) {
            console.error('Error in addRPMWithPoints:', error);
            if (error instanceof ApiError) throw error;
            throw new ApiError('Add RPMs With Points failed', INTERNAL_SERVER_ERROR);
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

    async deleteModel({ modelId }: { modelId: string }) {
        try {
            await this.connect();
            
            // Delete model, RPMs, and points in parallel
            const [modelResult, rpmResult, pointResult] = await Promise.all([
                this.db.collection('models').deleteOne({ _id: new ObjectId(modelId) }),
                this.db.collection('rpms').deleteMany({ modelId: new ObjectId(modelId) }),
                this.db.collection('points').deleteMany({ modelId: new ObjectId(modelId) })
            ]);
            
            // if (!modelResult.deletedCount) {
            //     throw new ApiError('Model not found', NOT_FOUND);
            // }
            
            console.log(`✅ Deleted model ${modelId} with ${rpmResult.deletedCount} RPMs and ${pointResult.deletedCount} points`);
            return true;
            
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError('Delete model failed', INTERNAL_SERVER_ERROR);
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
            throw new ApiError('Get all models failed', INTERNAL_SERVER_ERROR);
        }
    }
}

export const nativeModelService = new NativeModelService(); 
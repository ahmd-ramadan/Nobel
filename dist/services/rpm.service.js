"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rpmService = void 0;
const repositories_1 = require("../repositories");
const utils_1 = require("../utils");
const points_utils_1 = require("../utils/points.utils");
const point_service_1 = require("./point.service");
class RPMService {
    constructor(rpmDataSource = repositories_1.rpmRepository) {
        this.rpmDataSource = rpmDataSource;
    }
    isRpmExists(_a) {
        return __awaiter(this, arguments, void 0, function* ({ rpm, modelId }) {
            const rpmIsExists = yield this.rpmDataSource.findOne({ rpm, modelId });
            if (!rpmIsExists) {
                throw new utils_1.ApiError('RPM not found', utils_1.NOT_FOUND);
            }
            return rpmIsExists;
        });
    }
    isRpmNotExists(_a) {
        return __awaiter(this, arguments, void 0, function* ({ rpm, modelId }) {
            const rpmIsExists = yield this.rpmDataSource.findOne({ rpm, modelId });
            if (rpmIsExists) {
                throw new utils_1.ApiError('RPM is Exists', utils_1.NOT_FOUND);
            }
            return rpmIsExists;
        });
    }
    addRPM(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { rpm, modelId } = data;
                yield this.isRpmNotExists({ rpm, modelId });
                return yield this.rpmDataSource.createOne(data);
            }
            catch (error) {
                if (error instanceof utils_1.ApiError)
                    throw error;
                throw new utils_1.ApiError('Add RPM failed', utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
    addRPMWithPoints(model) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { _id: modelId, startRpmNumber, endRpmNumber, points } = model;
                const firstRpm = yield this.rpmDataSource.createOne({ modelId, rpm: startRpmNumber });
                if (!firstRpm) {
                    throw new utils_1.ApiError('Add first RPM is failed', utils_1.INTERNAL_SERVER_ERROR);
                }
                const diameter = (0, points_utils_1.calculateDiameter)(parseInt(model.name));
                // Generate first rpm -> 1000 points
                const firstRpmPoints = (0, points_utils_1.calculateFirstRpm)(points, startRpmNumber, diameter);
                yield point_service_1.pointService.addAllPointForRpm({ modelId, rpmId: firstRpm._id, points: firstRpmPoints });
                // Process RPMs in batches to avoid overwhelming the database
                const batchSize = 5; // Reduced from 10 to 5 for better stability
                const totalRpms = endRpmNumber - startRpmNumber;
                for (let batchStart = startRpmNumber + 1; batchStart <= endRpmNumber; batchStart += batchSize) {
                    const batchEnd = Math.min(batchStart + batchSize - 1, endRpmNumber);
                    const batchPromises = [];
                    console.log(`Processing RPMs ${batchStart} to ${batchEnd}...`);
                    for (let rpm = batchStart; rpm <= batchEnd; rpm++) {
                        const nextRpm = yield this.rpmDataSource.createOne({ modelId, rpm });
                        if (!nextRpm) {
                            throw new utils_1.ApiError('Add next RPM is failed', utils_1.INTERNAL_SERVER_ERROR);
                        }
                        const nextRpmPoints = (0, points_utils_1.handleGenerateNextRpm)(firstRpmPoints, startRpmNumber, rpm, diameter);
                        batchPromises.push(point_service_1.pointService.addAllPointForRpm({ modelId, rpmId: nextRpm._id, points: nextRpmPoints }));
                    }
                    // Wait for current batch to complete before moving to next batch
                    yield Promise.all(batchPromises);
                    // Add a longer delay between batches to reduce database load
                    if (batchEnd < endRpmNumber) {
                        console.log(`⏳ Waiting 500ms before next batch...`);
                        yield new Promise(resolve => setTimeout(resolve, 500));
                    }
                }
            }
            catch (error) {
                console.error('Error in addRPMWithPoints:', error);
                if (error instanceof utils_1.ApiError)
                    throw error;
                throw new utils_1.ApiError('Add RPMs Wit Points failed', utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
}
exports.rpmService = new RPMService();

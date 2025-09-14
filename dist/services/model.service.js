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
exports.modelService = void 0;
const error_messages_1 = require("../constants/error.messages");
const models_1 = require("../models");
const repositories_1 = require("../repositories");
const utils_1 = require("../utils");
const rpm_service_1 = require("./rpm.service");
class ModelService {
    constructor(modelDataSource = repositories_1.modelRepository) {
        this.modelDataSource = modelDataSource;
    }
    isModelExists(modelId) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = yield this.modelDataSource.findOne({ _id: modelId });
            if (!model) {
                throw new utils_1.ApiError('Model not found', utils_1.NOT_FOUND);
            }
            return model;
        });
    }
    isModelExistsByName(modelName) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = yield this.modelDataSource.findOne({ name: modelName });
            return model;
        });
    }
    addModel(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const isModelExist = yield this.isModelExistsByName(data.name);
                if (isModelExist) {
                    throw new utils_1.ApiError(error_messages_1.ValidationErrorMessages.MODEL_EXIST, utils_1.CONFLICT);
                }
                const model = yield this.modelDataSource.createOne(data);
                // Process RPMs and points in the background
                process.nextTick(() => __awaiter(this, void 0, void 0, function* () {
                    try {
                        console.log(`🚀 Starting background processing for model: ${model.name} (RPMs ${model.startRpmNumber}-${model.endRpmNumber})`);
                        yield rpm_service_1.rpmService.addRPMWithPoints(model);
                        console.log(`\n💯 Successfully completed processing for model: ${model.name} 💯`);
                    }
                    catch (error) {
                        console.error(`❌ Error in background processing for model ${model.name}:`, error);
                        // You might want to add error tracking/logging here
                        // Consider updating the model status to indicate failure
                    }
                }));
                return model;
            }
            catch (error) {
                if (error instanceof utils_1.ApiError)
                    throw error;
                throw new utils_1.ApiError(error_messages_1.ValidationErrorMessages.ADD_MODEL_FAILED, utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
    updateModel(_a) {
        return __awaiter(this, arguments, void 0, function* ({ modelId, data }) {
            try {
                return yield this.modelDataSource.updateOne({ _id: modelId }, data);
            }
            catch (error) {
                if (error instanceof utils_1.ApiError)
                    throw error;
                throw new utils_1.ApiError(error_messages_1.ValidationErrorMessages.UPDATE_MODEL_FAILED, utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
    deleteModel(_a) {
        return __awaiter(this, arguments, void 0, function* ({ modelId }) {
            try {
                const deletedModel = yield this.modelDataSource.deleteOne({ _id: modelId });
                if (!deletedModel) {
                    throw new utils_1.ApiError(error_messages_1.ValidationErrorMessages.DELETE_MODEL_FAILED, utils_1.INTERNAL_SERVER_ERROR);
                }
                // Deleted rpms related with this model And Points
                yield Promise.all([
                    models_1.Point.deleteMany({ modelId }),
                    models_1.RPM.deleteMany({ modelId })
                ]);
                return true;
            }
            catch (error) {
                if (error instanceof utils_1.ApiError)
                    throw error;
                throw new utils_1.ApiError('Deleted model failed', utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getAllModels(_a) {
        return __awaiter(this, arguments, void 0, function* ({ type, page, size }) {
            try {
                let query = {};
                if (type)
                    query.type = type;
                const { skip, limit } = (0, utils_1.pagenation)({ page, size });
                return yield this.modelDataSource.find(query, { skip, limit });
            }
            catch (error) {
                if (error instanceof utils_1.ApiError)
                    throw error;
                throw new utils_1.ApiError(error_messages_1.ValidationErrorMessages.GET_ALL_MODEL_FAILED, utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
}
exports.modelService = new ModelService();

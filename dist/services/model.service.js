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
const repositories_1 = require("../repositories");
const utils_1 = require("../utils");
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
    addModel(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.modelDataSource.createOne(data);
            }
            catch (error) {
                if (error instanceof utils_1.ApiError)
                    throw error;
                throw new utils_1.ApiError('ِAdd model failed', utils_1.INTERNAL_SERVER_ERROR);
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
                throw new utils_1.ApiError('Updated model failed', utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
    deleteModel(_a) {
        return __awaiter(this, arguments, void 0, function* ({ modelId }) {
            try {
                const deletedModel = yield this.modelDataSource.deleteOne({ _id: modelId });
                // Deleted rpms related with this model
                // Delete poinsts related with this model
                return deletedModel;
            }
            catch (error) {
                if (error instanceof utils_1.ApiError)
                    throw error;
                throw new utils_1.ApiError('Deleted model failed', utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getAllModels(_a) {
        return __awaiter(this, arguments, void 0, function* ({ type }) {
            try {
                let query = {};
                if (type)
                    query.type = type;
                return yield this.modelDataSource.find(query);
            }
            catch (error) {
                if (error instanceof utils_1.ApiError)
                    throw error;
                throw new utils_1.ApiError('Deleted model failed', utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
}
exports.modelService = new ModelService();

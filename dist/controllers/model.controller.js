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
exports.getAllModels = exports.getModelById = exports.deleteModel = exports.updateModel = exports.addModel = void 0;
const utils_1 = require("../utils");
const validation_1 = require("../validation");
const model_service_1 = require("../services/model.service");
const addModel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = validation_1.addModelSchema.parse(req.body);
    const addedModel = yield model_service_1.modelService.addModel(data);
    res.status(utils_1.OK).json({
        success: true,
        message: 'Model added successfully',
        data: addedModel
    });
});
exports.addModel = addModel;
const updateModel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id: modelId } = validation_1.paramsSchema.parse(req.params);
    const data = validation_1.updateModelSchema.parse(req.body);
    const updatedModel = yield model_service_1.modelService.updateModel({ modelId, data });
    res.status(utils_1.OK).json({
        success: true,
        message: 'Model updated successfully',
        data: updatedModel
    });
});
exports.updateModel = updateModel;
const deleteModel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id: modelId } = validation_1.paramsSchema.parse(req.params);
    const deletedModel = yield model_service_1.modelService.deleteModel({ modelId });
    res.status(utils_1.OK).json({
        success: true,
        message: 'Deleted model successfully',
        data: deletedModel
    });
});
exports.deleteModel = deleteModel;
const getModelById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id: modelId } = validation_1.paramsSchema.parse(req.params);
    const model = yield model_service_1.modelService.isModelExists(modelId);
    res.status(utils_1.OK).json({
        success: true,
        message: 'Model retrivied successfully',
        data: model
    });
});
exports.getModelById = getModelById;
const getAllModels = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = validation_1.getAllModelsSchema.parse(req.query);
    const { page, size } = validation_1.paginationSchema.parse(req.query);
    const models = yield model_service_1.modelService.getAllModels(Object.assign(Object.assign({}, query), { page, size }));
    res.status(utils_1.OK).json({
        success: true,
        message: 'Models retrivied successfully',
        data: models
    });
});
exports.getAllModels = getAllModels;

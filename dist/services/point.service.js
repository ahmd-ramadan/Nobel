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
exports.pointService = void 0;
const repositories_1 = require("../repositories");
const utils_1 = require("../utils");
const rpm_service_1 = require("./rpm.service");
class PointService {
    constructor(pointDataSource = repositories_1.pointRepository) {
        this.pointDataSource = pointDataSource;
    }
    isPointExists(pointId) {
        return __awaiter(this, void 0, void 0, function* () {
            const point = yield this.pointDataSource.findOne({ _id: pointId });
            if (!point) {
                throw new utils_1.ApiError('Point not found', utils_1.NOT_FOUND);
            }
            return point;
        });
    }
    addPoint(_a) {
        return __awaiter(this, arguments, void 0, function* ({ isUpdate, data }) {
            try {
                const { rpm, modelId, points } = data;
                let addedRPM = {};
                if (isUpdate) {
                    addedRPM = yield rpm_service_1.rpmService.isRpmExists({ rpm, modelId });
                }
                else {
                    addedRPM = yield rpm_service_1.rpmService.addRPM({ rpm, modelId });
                }
                if (isUpdate) {
                    yield this.pointDataSource.deleteMany({ modelId, rpmId: addedRPM._id });
                }
                let newPoints = points.map((point) => {
                    return Object.assign({ modelId, rpmId: addedRPM._id }, point);
                });
                const addedPoints = yield repositories_1.pointRepository.insertMany(newPoints);
                return true;
            }
            catch (error) {
                console.log(error);
                // If any error delete all points and rpms for this model
                if (error instanceof utils_1.ApiError)
                    throw error;
                throw new utils_1.ApiError('Add points data failed', utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
}
exports.pointService = new PointService();

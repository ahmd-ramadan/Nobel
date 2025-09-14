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
exports.getAllPoints = exports.addPointsData = void 0;
const utils_1 = require("../utils");
const services_1 = require("../services");
const validation_1 = require("../validation");
const addPointsData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = validation_1.addPointsDataSchema.parse(req.body);
    const addedPoints = yield services_1.pointService.addPoint({ isUpdate: false, data });
    res.status(utils_1.OK).json({
        success: true,
        message: 'Points Data added successfully',
        data: addedPoints
    });
});
exports.addPointsData = addPointsData;
const getAllPoints = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = validation_1.getAllPointsSchema
        .parse(req.query);
    const allPointsForRpm = yield services_1.pointService.getAllPoints(query);
    res.status(200).json({
        success: true,
        message: "All points retrieved successfully",
        data: allPointsForRpm
    });
});
exports.getAllPoints = getAllPoints;

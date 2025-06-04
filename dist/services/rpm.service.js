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
}
exports.rpmService = new RPMService();

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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.otpService = exports.OtpService = void 0;
const repositories_1 = require("../repositories");
const utils_1 = require("../utils");
const node_cron_1 = __importDefault(require("node-cron"));
class OtpService {
    constructor(otpDataSource = repositories_1.otpRepository) {
        this.otpDataSource = otpDataSource;
    }
    createOne(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.otpDataSource.createOne(data);
        });
    }
    findOne(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.otpDataSource.findOne(query);
        });
    }
    isOtpValid(_a) {
        return __awaiter(this, arguments, void 0, function* ({ otp }) {
            const isOtpExist = yield this.findOne({ otp });
            if (!isOtpExist) {
                throw new utils_1.ApiError('رمز التحقق غير صحيح أو منتهي الصلاحية', utils_1.NOT_FOUND);
            }
            if (isOtpExist.expiresAt < new Date()) {
                throw new utils_1.ApiError('رمز التحقق منتهي الصلاحية', utils_1.CONFLICT);
            }
            return isOtpExist;
        });
    }
    deleteOne(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.otpDataSource.deleteOne(query);
        });
    }
    deleteExpiredOtps() {
        return __awaiter(this, void 0, void 0, function* () {
            const now = new Date();
            return this.otpDataSource.deleteMany({ expiresAt: { lt: now } });
        });
    }
    scheduleOtpCleanupTask() {
        node_cron_1.default.schedule('0 0 * * *', () => {
            utils_1.logger.info('Cleanup otpss cron job started 🕛');
            this.deleteExpiredOtps()
                .then(() => {
                utils_1.logger.info('Cleanup otps cron job completed ✅');
            })
                .catch((error) => {
                utils_1.logger.error('Cleanup otps cron job failed ❌', error);
            });
        });
    }
}
exports.OtpService = OtpService;
exports.otpService = new OtpService();

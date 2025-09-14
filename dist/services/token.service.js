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
exports.tokenService = void 0;
const repositories_1 = require("../repositories");
const utils_1 = require("../utils");
const node_cron_1 = __importDefault(require("node-cron"));
class TokenService {
    constructor(tokenDataSource = repositories_1.tokenRepository) {
        this.tokenDataSource = tokenDataSource;
    }
    createOne(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.tokenDataSource.createOne(data);
        });
    }
    findOne(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.tokenDataSource.findOne(query);
        });
    }
    updateOne(query, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.tokenDataSource.updateOne(query, data);
        });
    }
    deleteOne(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.tokenDataSource.updateOne(query, {
                isActive: false,
                isDeleted: true,
            });
        });
    }
    deleteMany(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.tokenDataSource.updateMany(query, {
                isActive: false,
                isDeleted: true,
            });
        });
    }
    tokenExists(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const now = new Date();
            const tokenExist = yield this.findOne({
                token,
                expiresAt: { $gt: now },
                isActive: true,
                isDeleted: false,
            });
            // console.log(tokenExist, refreshToken);
            if (!tokenExist) {
                throw new utils_1.ApiError('Invalid or expired token', utils_1.UNAUTHORIZED);
            }
            return tokenExist;
        });
    }
    deleteExpiredTokens() {
        return __awaiter(this, void 0, void 0, function* () {
            const now = new Date();
            return this.deleteMany({ expiresAt: { lt: now } });
        });
    }
    scheduleTokenCleanupTask() {
        node_cron_1.default.schedule('0 0 * * *', () => __awaiter(this, void 0, void 0, function* () {
            utils_1.logger.info('Cleanup tokens cron job started 🕛');
            try {
                yield this.deleteExpiredTokens();
                utils_1.logger.info('Cleanup tokens cron job completed ✅');
            }
            catch (error) {
                utils_1.logger.error('Cleanup tokens cron job failed ❌', error);
            }
            ;
        }));
    }
}
exports.tokenService = new TokenService();

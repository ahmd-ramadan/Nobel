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
class GeneralRepository {
    constructor(dbClient) {
        this.dbClient = dbClient;
    }
    // private async populateHelper<FunResponse>(docPromise: Promise<any>, populate?: PopulateType): Promise<FunResponse | null> {
    //     const result = await docPromise;
    //     if (!populate || !result) return result;
    //     if (typeof result.populate === 'function') {
    //         return await result.populate(populate);
    //     }
    //     return result;
    // }
    populateHelper(docPromise, populate) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield docPromise;
            if (!populate || !result)
                return result;
            if (typeof result.populate === 'function') {
                const populated = yield result.populate(populate);
                if (typeof populated.exec === 'function') {
                    return yield populated.exec();
                }
                return populated;
            }
            return result;
        });
    }
    createOne(data, populate) {
        return __awaiter(this, void 0, void 0, function* () {
            const created = yield this.dbClient.create(data);
            if (populate) {
                return this.populateHelper(this.dbClient.findById(created._id), populate);
            }
            return created;
        });
    }
    findOne(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.dbClient.findOne(query);
        });
    }
    findOneWithPopulate(query, populate) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.populateHelper(this.dbClient.findOne(query), populate);
        });
    }
    find(query, options) {
        return __awaiter(this, void 0, void 0, function* () {
            let dbQuery = this.dbClient.find(query);
            if (options === null || options === void 0 ? void 0 : options.skip)
                dbQuery = dbQuery.skip(options.skip);
            if (options === null || options === void 0 ? void 0 : options.limit)
                dbQuery = dbQuery.limit(options.limit);
            return dbQuery;
        });
    }
    findWithPopulate(query, populate, options) {
        return __awaiter(this, void 0, void 0, function* () {
            let dbQuery = this.dbClient.find(query);
            if (options === null || options === void 0 ? void 0 : options.skip)
                dbQuery = dbQuery.skip(options.skip);
            if (options === null || options === void 0 ? void 0 : options.limit)
                dbQuery = dbQuery.limit(options.limit);
            return yield this.populateHelper(dbQuery, populate);
        });
    }
    findById(objectId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.dbClient.findById(objectId);
        });
    }
    findByIdWithPopulate(objectId, populate) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.populateHelper(this.dbClient.findById(objectId), populate);
        });
    }
    updateOne(query, data, populate) {
        return __awaiter(this, void 0, void 0, function* () {
            const updated = this.dbClient.findOneAndUpdate(query, { $set: data }, { new: true });
            return this.populateHelper(updated, populate);
        });
    }
    updateMany(query, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.dbClient.updateMany(query, { $set: data });
        });
    }
    deleteOne(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.dbClient.findOneAndDelete(query);
        });
    }
    deleteMany(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.dbClient.deleteMany(query);
        });
    }
}
exports.default = GeneralRepository;

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
exports.HashingService = void 0;
const bcryptjs_1 = require("bcryptjs");
const config_1 = require("../config");
const utils_1 = require("../utils");
class HashingService {
    static hash(text) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!text) {
                throw new utils_1.ApiError('Missing information to hash', utils_1.BAD_REQUEST);
            }
            return yield (0, bcryptjs_1.hash)(text, Number(config_1.bcryptSaltRounds));
        });
    }
    static compare(text, hashedText) {
        if (!text || !hashedText) {
            throw new utils_1.ApiError('Missing information to compare', utils_1.BAD_REQUEST);
        }
        return (0, bcryptjs_1.compare)(text, hashedText);
    }
}
exports.HashingService = HashingService;

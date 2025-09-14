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
exports.checkDatabaseHealth = exports.connectWithDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("../config");
const utils_1 = require("../utils");
const connectWithDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    const options = {
        // Increase connection timeout for large operations
        connectTimeoutMS: 600000, // 60 seconds
        socketTimeoutMS: 600000, // 60 seconds
        serverSelectionTimeoutMS: 600000, // 60 seconds
        // Optimize connection pool for large operations
        maxPoolSize: 50, // Increase pool size
        minPoolSize: 10, // Maintain minimum connections
        // Enable retry writes for better reliability
        retryWrites: true,
        // Buffer commands to handle large operations
        bufferCommands: true,
        // Enable write concern for better reliability
        w: 1, // Use number instead of string
        journal: true // Use 'journal' instead of deprecated 'j'
    };
    mongoose_1.default.connect(config_1.mongodbUrl, options).then(() => {
        utils_1.logger.info(`Database is running now ^_^`);
        // Monitor connection events
        mongoose_1.default.connection.on('error', (error) => {
            utils_1.logger.error(`MongoDB connection error: ${error}`);
        });
        mongoose_1.default.connection.on('disconnected', () => {
            utils_1.logger.warn('MongoDB disconnected');
        });
        mongoose_1.default.connection.on('reconnected', () => {
            utils_1.logger.info('MongoDB reconnected');
        });
    }).catch((error) => {
        utils_1.logger.error(`Error occurred while connection with database - ${error} ❌`);
        process.exit(1);
    });
});
exports.connectWithDatabase = connectWithDatabase;
// Health check function to test database connectivity
const checkDatabaseHealth = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (mongoose_1.default.connection.readyState === 1 && mongoose_1.default.connection.db) {
            // Connection is ready, do a simple ping
            yield mongoose_1.default.connection.db.admin().ping();
            return true;
        }
        return false;
    }
    catch (error) {
        utils_1.logger.error(`Database health check failed: ${error}`);
        return false;
    }
});
exports.checkDatabaseHealth = checkDatabaseHealth;

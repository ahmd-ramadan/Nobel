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
exports.start = void 0;
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const utils_1 = require("./utils");
const config_1 = require("./config");
const middlewares_1 = require("./middlewares");
const routes_1 = __importDefault(require("./routes"));
const utils_2 = require("./utils");
const services_1 = require("./services");
const app = (0, express_1.default)();
const morganLogger = config_1.nodeEnv === utils_1.SERVER.DEVELOPMENT
    ? (0, morgan_1.default)('dev')
    : (0, morgan_1.default)('combined', {
        skip: (_, res) => res.statusCode < utils_1.INTERNAL_SERVER_ERROR,
    });
app.get('/', (_, res) => {
    res.send('<div style="text-align: center; margin-top: 20px;"><h1>Welcome to Nobel Apis</h1></div>');
});
app.set("trust proxy", 1);
app.use((0, cors_1.default)(config_1.corsConfig));
app.use(morganLogger);
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.use(express_1.default.json({ limit: '5mb' }));
app.use(middlewares_1.xss);
app.use('/api/v1', routes_1.default);
app.use(middlewares_1.errorHandler);
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        services_1.tokenService.scheduleTokenCleanupTask();
        yield (0, utils_2.connect)();
        const server = app.listen(Number(config_1.port) || utils_1.SERVER.DEFAULT_PORT_NUMBER, '0.0.0.0', () => {
            utils_1.logger.info(`Server is running on ${config_1.port || utils_1.SERVER.DEFAULT_PORT_NUMBER} 🚀`);
        });
        process.on('SIGINT', () => {
            utils_1.logger.warn('Shutting down gracefully...');
            server.close(() => {
                utils_1.logger.info('Server closed successfully! 👋');
                process.exit(0);
            });
        });
    }
    catch (error) {
        utils_1.logger.error(`Error occurred while starting the server - ${error} ❌`);
        process.exit(1);
    }
});
exports.start = start;

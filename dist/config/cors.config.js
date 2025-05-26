"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsConfig = void 0;
const utils_1 = require("../utils");
const server_env_1 = require("./server.env");
const client_env_1 = require("./client.env");
exports.corsConfig = {
    origin: server_env_1.nodeEnv === (utils_1.SERVER === null || utils_1.SERVER === void 0 ? void 0 : utils_1.SERVER.DEVELOPMENT) ? utils_1.SERVER === null || utils_1.SERVER === void 0 ? void 0 : utils_1.SERVER.LOCALHOST_URLS : client_env_1.clientUrl,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

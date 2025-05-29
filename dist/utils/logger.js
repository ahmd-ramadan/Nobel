"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const constants_1 = require("./constants");
winston_1.default.addColors({
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
});
const format = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: "YYYY-MM-DD HH-mm-ss" }), winston_1.default.format.colorize({ all: true }), winston_1.default.format.printf(({ timestamp, level, message, meta }) => {
    return `${timestamp} [${level}]: ${message} ${meta ? JSON.stringify(meta) : ''}`;
}));
exports.logger = winston_1.default.createLogger({
    level: process.env.NODE_ENV === constants_1.SERVER.PRODUCTION ? 'info' : 'debug',
    transports: [
        new winston_1.default.transports.Console({ format }),
        new winston_1.default.transports.File({
            filename: "logs/errors.log",
            level: 'error',
            format: winston_1.default.format.json()
        }),
        new winston_1.default.transports.File({
            filename: "logs/all.log",
            format: winston_1.default.format.json()
        })
    ]
});

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.xss = void 0;
const dompurify_1 = __importDefault(require("dompurify"));
const jsdom_1 = require("jsdom");
const { window } = new jsdom_1.JSDOM('');
const DOMPurify = (0, dompurify_1.default)(window);
const sanitizeObject = (dataToSanitize) => {
    if (typeof dataToSanitize === 'string') {
        return DOMPurify.sanitize(dataToSanitize, { ALLOWED_TAGS: [] });
    }
    else if (Array.isArray(dataToSanitize)) {
        return dataToSanitize.map((item) => sanitizeObject(item));
    }
    else if (dataToSanitize && typeof dataToSanitize === 'object') {
        const sanitizedObj = {};
        for (const key in dataToSanitize) {
            if (Object.prototype.hasOwnProperty.call(dataToSanitize, key)) {
                sanitizedObj[key] = sanitizeObject(dataToSanitize[key]);
            }
        }
        return sanitizedObj;
    }
    return dataToSanitize;
};
const xss = (req, _res, next) => {
    req.body = sanitizeObject(req.body);
    // req.query = { ... sanitizeObject(req.query) }
    Object.assign(req.query, sanitizeObject(req.query));
    req.params = sanitizeObject(req.params);
    next();
};
exports.xss = xss;

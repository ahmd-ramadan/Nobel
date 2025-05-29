"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkFiles = void 0;
const checkFiles = (req) => {
    const rawFiles = Array.isArray(req.files) ? req.files : req.file ? [req.file] : [];
    const files = rawFiles.filter((f) => f !== undefined);
    return files;
};
exports.checkFiles = checkFiles;

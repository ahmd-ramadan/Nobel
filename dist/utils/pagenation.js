"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pagenation = void 0;
const pagenation = ({ page, size }) => {
    const limit = size || 100;
    const skip = (page > 0 ? page - 1 : 0) * size;
    return { limit, skip };
};
exports.pagenation = pagenation;

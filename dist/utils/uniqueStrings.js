"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCode = exports.generateUniqueString = void 0;
const generateUniqueString = ({ length = 7, type = "chars" }) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const slugs = "abcdefghijklmnopqrstuvwxyz0123456789";
    const numbers = "0123456789";
    let size = chars.length;
    let str = chars;
    if (type === "slugs") {
        size = slugs.length;
        str = slugs;
    }
    else if (type === "numbers") {
        size = numbers.length;
        str = numbers;
    }
    let code = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = (Math.random() * size);
        code += str.charAt(randomIndex);
    }
    return code;
};
exports.generateUniqueString = generateUniqueString;
const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
exports.generateCode = generateCode;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.multerMiddleHost = exports.allowedExtensions = void 0;
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const utils_1 = require("../utils");
exports.allowedExtensions = {
    image: ["jpg", "jpeg", "png", "gif", "jfif", "webp"],
    video: ["mp4", "avi", "mkv"],
    audio: ["mp3", "wav"],
    document: ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt"],
    code: ["js", "jsx", "ts", "tsx", "html", "css", "scss", "json", "xml"],
    compressed: ["zip", "rar", "7z"],
};
const multerMiddleHost = ({ extensions = exports.allowedExtensions.image }) => {
    //! diskStorage
    const storage = multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            const destinationPath = path_1.default.join(__dirname, "..", "uploads", "temp", "images");
            if (!fs_1.default.existsSync(destinationPath)) {
                fs_1.default.mkdirSync(destinationPath, { recursive: true });
            }
            cb(null, destinationPath);
        },
        filename: (req, file, cb) => {
            const uniqueFileName = (0, utils_1.generateUniqueString)({ length: 6 }) + "_" + file.originalname;
            cb(null, uniqueFileName);
        },
    });
    const fileFilter = (req, file, cb) => {
        if (extensions.includes(file.mimetype.split("/")[1])) {
            return cb(null, true);
        }
        cb(new utils_1.ApiError("Image format is not allowed!", utils_1.BAD_REQUEST));
    };
    const file = (0, multer_1.default)({ fileFilter, storage });
    return file;
};
exports.multerMiddleHost = multerMiddleHost;

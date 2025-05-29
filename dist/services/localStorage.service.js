"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.localStorageService = exports.LocalStorageService = void 0;
const fs_1 = require("fs");
const path_1 = __importStar(require("path"));
const utils_1 = require("../utils");
const createFolderIfNotExists = (folderPath) => {
    if (!(0, fs_1.existsSync)(folderPath)) {
        (0, fs_1.mkdirSync)(folderPath, { recursive: true });
    }
};
class LocalStorageService {
    getFolderPath(type) {
        return path_1.default.join(__dirname, '..', 'uploads', 'public', type);
    }
    // Upload the image locally
    uploadImage(_a) {
        return __awaiter(this, arguments, void 0, function* ({ fileToUpload, type }) {
            try {
                const folderPath = this.getFolderPath(type);
                createFolderIfNotExists(folderPath);
                const fileName = `${Date.now()}_${fileToUpload.originalname}`;
                const filePath = (0, path_1.resolve)(folderPath, fileName);
                let fileBuffer;
                if (fileToUpload.buffer) {
                    // If file is a buffer (i.e., direct upload with multer buffer)
                    fileBuffer = fileToUpload.buffer;
                }
                else if (fileToUpload.path) {
                    // If file has a path (i.e., it's already saved on the server)
                    fileBuffer = (0, fs_1.readFileSync)(fileToUpload.path);
                }
                else {
                    throw new utils_1.ApiError('بيانات الملف غير صالحة', utils_1.BAD_REQUEST);
                }
                (0, fs_1.writeFileSync)(filePath, fileBuffer);
                return filePath;
            }
            catch (err) {
                console.error(err);
                throw new utils_1.ApiError('فشل في تحميل الصورة إلى السيرفر المحلي', utils_1.INTERNAL_SERVER_ERROR);
            }
            finally {
                // Clean up the temporary file if it was uploaded via path
                if (fileToUpload && fileToUpload.path) {
                    (0, fs_1.unlinkSync)(fileToUpload.path);
                }
            }
        });
    }
    deleteImage(_a) {
        return __awaiter(this, arguments, void 0, function* ({ fileName, type }) {
            try {
                // const folderPath = this.getFolderPath(type);
                // const filePath = resolve(folderPath, fileName);
                const filePath = fileName;
                if ((0, fs_1.existsSync)(filePath)) {
                    (0, fs_1.unlinkSync)(filePath);
                    return true;
                }
                else {
                    throw new utils_1.ApiError('الصورة غير موجودة في السيرفر', utils_1.BAD_REQUEST);
                }
            }
            catch (err) {
                console.error(err);
                throw new utils_1.ApiError('فشل في حذف الصورة من السيرفر المحلي', utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
    updateImage(_a) {
        return __awaiter(this, arguments, void 0, function* ({ oldFileName, fileToUpload, type, }) {
            try {
                const folderPath = this.getFolderPath(type);
                yield this.deleteImage({ fileName: oldFileName, type });
                return yield this.uploadImage({ fileToUpload, type });
            }
            catch (err) {
                console.error(err);
                throw new utils_1.ApiError('فشل في تحديث الصورة على السيرفر المحلي', utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
}
exports.LocalStorageService = LocalStorageService;
exports.localStorageService = new LocalStorageService();

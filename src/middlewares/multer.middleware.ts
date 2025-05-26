import multer, { StorageEngine, FileFilterCallback } from "multer";
import fs from "fs";
import path from "path";
import { ApiError, BAD_REQUEST, generateUniqueString } from "../utils";
import { Request } from "express";

export const allowedExtensions: Record<string, string[]> = {
    image: ["jpg", "jpeg", "png", "gif", "jfif", "webp"],
    video: ["mp4", "avi", "mkv"],
    audio: ["mp3", "wav"],
    document: ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt"],
    code: ["js", "jsx", "ts", "tsx", "html", "css", "scss", "json", "xml"],
    compressed: ["zip", "rar", "7z"],
};

interface MulterOptions {
    extensions?: string[];
}

export const multerMiddleHost = ({ extensions = allowedExtensions.image }: MulterOptions) => {
    //! diskStorage
    const storage: StorageEngine = multer.diskStorage({
        destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
            const destinationPath = path.join(__dirname, "..", "uploads", "temp", "images");
                if (!fs.existsSync(destinationPath)) {
                    fs.mkdirSync(destinationPath, { recursive: true });
                }
                cb(null, destinationPath);
            },

            filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
                const uniqueFileName = generateUniqueString({ length: 6 }) + "_" + file.originalname;
            cb(null, uniqueFileName);
        },
    });

    const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
        if (extensions.includes(file.mimetype.split("/")[1])) {
            return cb(null, true);
        }
        cb(new ApiError("Image format is not allowed!", BAD_REQUEST));
    };

    const file = multer({ fileFilter, storage });
    return file;
};

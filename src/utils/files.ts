import { Request } from "express";
import { AuthenticatedRequest } from "../interfaces";

export const checkFiles = (req: AuthenticatedRequest | Request): Express.Multer.File[] => {
    const rawFiles = Array.isArray(req.files) ? req.files : req.file ? [req.file] : [];
    const files: Express.Multer.File[] = rawFiles.filter((f): f is Express.Multer.File => f !== undefined);
    return files;
}
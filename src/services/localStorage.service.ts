import { unlinkSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import path, { resolve } from 'path';
import { ApiError, BAD_REQUEST, INTERNAL_SERVER_ERROR } from '../utils';

const createFolderIfNotExists = (folderPath: string) => {
    if (!existsSync(folderPath)) {
        mkdirSync(folderPath, { recursive: true });
    }
};

type folderTypes = 'categories' | 'products';

export class LocalStorageService {

    private getFolderPath(type: folderTypes): string {
        return path.join(__dirname, '..', 'uploads', 'public', type);
    }

    // Upload the image locally
    async uploadImage({ fileToUpload, type }: { fileToUpload: any, type: folderTypes }): Promise<string> {
        try {
            const folderPath = this.getFolderPath(type); 

            createFolderIfNotExists(folderPath);

            const fileName = `${Date.now()}_${fileToUpload.originalname}`;
            const filePath = resolve(folderPath, fileName);

            let fileBuffer: Buffer;

            if (fileToUpload.buffer) {
                // If file is a buffer (i.e., direct upload with multer buffer)
                fileBuffer = fileToUpload.buffer;
            } else if (fileToUpload.path) {
                // If file has a path (i.e., it's already saved on the server)
                fileBuffer = readFileSync(fileToUpload.path);
            } else {
                throw new ApiError('بيانات الملف غير صالحة', BAD_REQUEST);
            }

            writeFileSync(filePath, fileBuffer);

            return filePath;
        } catch (err) {
            console.error(err);
            throw new ApiError('فشل في تحميل الصورة إلى السيرفر المحلي', INTERNAL_SERVER_ERROR);
        } finally {
            // Clean up the temporary file if it was uploaded via path
            if (fileToUpload && fileToUpload.path) {
                unlinkSync(fileToUpload.path);
            }
        }
    }

    async deleteImage({ fileName, type }: { fileName: string, type: folderTypes }): Promise<boolean> {
        try {
            // const folderPath = this.getFolderPath(type);
            // const filePath = resolve(folderPath, fileName);
            const filePath = fileName;
            if (existsSync(filePath)) {
                unlinkSync(filePath);
                return true;
            } else {
                throw new ApiError('الصورة غير موجودة في السيرفر', BAD_REQUEST);
            }
        } catch (err) {
            console.error(err);
            throw new ApiError('فشل في حذف الصورة من السيرفر المحلي', INTERNAL_SERVER_ERROR);
        }
    }

    async updateImage({
        oldFileName,
        fileToUpload,
        type,
    }: {
        oldFileName: string;
        fileToUpload: any;
        type: folderTypes;
    }): Promise<string> {
        try {
            const folderPath = this.getFolderPath(type);
            
            await this.deleteImage({ fileName: oldFileName, type });

            return await this.uploadImage({ fileToUpload, type });
        } catch (err) {
            console.error(err);
            throw new ApiError('فشل في تحديث الصورة على السيرفر المحلي', INTERNAL_SERVER_ERROR);
        }
    }
}

export const localStorageService = new LocalStorageService();

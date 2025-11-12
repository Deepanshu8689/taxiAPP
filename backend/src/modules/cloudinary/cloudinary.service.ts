import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
    async uploadImage(file: Express.Multer.File, folder: 'taxi-app'): Promise<string> {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder },
                (error: UploadApiErrorResponse, result: UploadApiResponse) => {
                    if (error) return reject(error)
                    resolve(result.secure_url)
                }
            )
            uploadStream.end(file.buffer)
        })
    }

    async uploadMultiple(files: Express.Multer.File[], folder: 'taxi-app' = 'taxi-app'): Promise<string[]> {
        const urls: string[] = [];
        for (const file of files) {
            const url = await this.uploadImage(file, folder);
            urls.push(url);
        }
        return urls;
    }

}

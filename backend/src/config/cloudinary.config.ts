import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface'
import { v2 as cloudinary } from 'cloudinary'
import * as dotenv from 'dotenv'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
dotenv.config()

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
})
export const CloudinaryStorageConfig = new CloudinaryStorage ({
    cloudinary,
    params: {
        folder: 'taxiApp',
        allowedFormats: ['jpg', 'png', 'jpeg', 'webp']
    } as any
})

export const CloudinaryMulterConfig: MulterOptions = {
  storage: CloudinaryStorageConfig,
};

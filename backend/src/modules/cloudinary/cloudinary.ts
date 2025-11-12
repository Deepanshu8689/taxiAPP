import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class Cloudinary {
    provide: "Cloudinary"
    inject: [ConfigService]
    useFactory(configService: ConfigService) {
        cloudinary.config({
            cloud_name: configService.get('CLOUDINARY_CLOUD_NAME'),
            api_key: configService.get('CLOUDINARY_API_KEY'),
            api_secret: configService.get('CLOUDINARY_API_SECRET'),
        })
        console.log("cloudinary: ", cloudinary)
        return cloudinary
    }
}

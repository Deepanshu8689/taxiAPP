import { diskStorage } from "multer"
import { extname } from "path";

export const multerVehicleConfig = {
    storage: diskStorage({
        destination: './uploads/vehicles',
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
        }
    })
}
export const multerUserConfig = {
    storage: diskStorage({
        destination: './uploads/user',
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
        }
    })
}
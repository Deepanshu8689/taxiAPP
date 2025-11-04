import { IsLatitude, IsLongitude } from "class-validator";

export class LocationDTO {
    @IsLatitude()
    latitude: number
    
    @IsLongitude()
    longitude: number
}
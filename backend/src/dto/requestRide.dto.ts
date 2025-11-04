import { IsInt, IsLatitude, IsLongitude, IsNotEmpty, IsNumber, IsString } from "class-validator"

export class GetFareDTO {
    @IsString()
    @IsNotEmpty()
    pickupLocation: string

    @IsString()
    @IsNotEmpty()
    dropLocation: string

}

export class RequestRideDTO {
    @IsString()
    @IsNotEmpty()
    pickupLocation: string

    @IsString()
    @IsNotEmpty()
    dropLocation: string

    @IsString()
    @IsNotEmpty()
    vehicleType: string

    @IsNumber()
    @IsNotEmpty()
    distance: number

    @IsNumber()
    @IsNotEmpty()
    estimatedFare: number

    @IsLatitude()
    pickupLat: number; // these four are used to update real time location

    @IsLongitude()
    pickupLng: number;

    @IsLatitude()
    dropLat: number;

    @IsLongitude()
    dropLng: number;

}
import { IsNotEmpty, IsString } from "class-validator";

export class VehicleDTO {
    @IsNotEmpty()
    @IsString()
    vehicleNumber: string

    @IsNotEmpty()
    @IsString()
    vehicleType: string

    @IsNotEmpty()
    @IsString()
    vehicleModel: string

    @IsNotEmpty()
    @IsString()
    vehicleColor: string

    @IsNotEmpty()
    @IsString()
    vehicleName: string

    vehicleImage: string

    vehicleRC: string;

    vehicleInsurance: string;

}
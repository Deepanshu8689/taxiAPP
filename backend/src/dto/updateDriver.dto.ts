import { IsInt, IsNumber, IsOptional, IsString, Min } from "class-validator";


export class UpdateDriverDTO {
    @IsString()
    @IsOptional()
    firstName: string

    @IsString()
    @IsOptional()
    lastName: string

    @IsInt()
    @IsOptional()
    age: number

    @IsString()
    @IsOptional()
    phoneNumber?: string

    @IsOptional()
    image?: string

    @IsOptional()
    drivingLicence?: string

    @IsOptional()
    // @Min(2)
    drivingExperience?: number

    @IsString()
    @IsOptional()
    emailId?: string
}
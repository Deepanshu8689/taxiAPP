import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";


export class UpdateUserDTO {
    @IsString()
    @IsOptional()
    firstName: string

    @IsString()
    @IsOptional()
    lastName: string

    @IsString()
    @IsOptional()
    phoneNumber: string

    @IsOptional()
    age: number

    @IsOptional()
    image?: string

    @IsString()
    @IsOptional()
    emailId?: string
}

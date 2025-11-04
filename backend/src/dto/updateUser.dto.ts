import { IsInt, IsNumber, IsOptional, IsString, Min } from "class-validator";


export class UpdateUserDTO {
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

    @IsString()
    @IsOptional()
    emailId?: string
}
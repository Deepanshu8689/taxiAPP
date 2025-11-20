import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LoginDTO {
    @IsString()
    @IsNotEmpty()
    otp: string

    @IsString()
    @IsNotEmpty()
    phoneNumber: string
}
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LoginDTO {
    @IsEmail()
    @IsNotEmpty()
    emailId: string

    @IsString()
    @IsNotEmpty()
    password: string
}
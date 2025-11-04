import { IsEmail, IsInt, IsNotEmpty, IsNumber, IsPhoneNumber, IsString, IsStrongPassword } from "class-validator";

export class SignupDTO {
    @IsEmail()
    @IsNotEmpty()
    emailId: string
    
    @IsString()
    @IsNotEmpty()
    firstName: string
    
    @IsString()
    @IsNotEmpty()
    lastName: string
    
    @IsString()
    @IsNotEmpty()
    confirmPassword: string
    
    @IsStrongPassword()
    @IsNotEmpty()
    password: string
    
    @IsString()
    @IsNotEmpty()
    phoneNumber: string
    
    @IsInt()
    @IsNotEmpty()
    age: number

    @IsString()
    @IsNotEmpty()
    role: string
}
import { IsEmail, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPhoneNumber, IsString, IsStrongPassword } from "class-validator";

export class AdminSignupDTO {
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
    phoneNumber: string
    
    @IsInt()
    @IsNotEmpty()
    age: number

}

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
    phoneNumber: string

    @IsString()
    @IsNotEmpty()
    role: string
    
    @IsInt()
    @IsOptional()
    age: number
}
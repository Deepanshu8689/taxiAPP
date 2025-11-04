import { Injectable } from "@nestjs/common";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

@Injectable()
export class BankDetailsDTO{
    @IsNotEmpty()
    @IsNumber()
    accountNumber: string

    @IsNotEmpty()
    @IsString()
    bankName: string

    @IsNotEmpty()
    @IsString()
    IFSCcode: string
    
    @IsNotEmpty()
    @IsString()
    branchName: string
}
import { Injectable } from "@nestjs/common";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

@Injectable()
export class BankDetailsDTO{

    @IsString()
    accountNumber?: string

    @IsString()
    IFSCcode?: string
    
    @IsOptional()
    @IsString()
    vpaAddress?: string

    @IsString()
    type: ['bank_account', 'vpa']
}
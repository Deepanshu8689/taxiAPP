import { Injectable } from "@nestjs/common";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

@Injectable()
export class BankDetailsDTO{

    @IsString()
    @IsOptional()
    accountNumber?: string

    @IsString()
    @IsOptional()
    IFSCcode?: string
    
    @IsOptional()
    @IsString()
    vpaAddress?: string

    @IsString()
    type: ['bank_account', 'vpa']
}
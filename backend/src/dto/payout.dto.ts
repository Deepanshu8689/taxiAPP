import { Injectable } from "@nestjs/common";
import { IsInt, IsNotEmpty, IsString } from "class-validator";

@Injectable()
export class BankPayoutDTO {
    @IsString()
    @IsNotEmpty()
    fundAccountId: string;

    @IsInt()
    @IsNotEmpty()
    amount: number;

    @IsString()
    @IsNotEmpty()
    referenceId: string;

    @IsString()
    mode?: ["NEFT", "IMPS", "RTGS"]
}

export class PayoutDTO {
    @IsString()
    @IsNotEmpty()
    fund_account_id: string;

    @IsNotEmpty()
    amount: number;

    @IsString()
    @IsNotEmpty()
    referenceId: string;
}
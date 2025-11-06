import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { PayoutService } from './payout.service';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { RoleGuard } from 'src/common/guards/role/role.guard';
import { Role } from 'src/enum/role.enum';
import { Roles } from 'src/common/decorators/role.decorator';
import { BankPayoutDTO, PayoutDTO } from 'src/dto/payout.dto';

@Controller('payout')
@UseGuards(AuthGuard, RoleGuard)
export class PayoutController {
    constructor(
        private payoutService: PayoutService
    ){}

    @Post('/createContact/:id')
    @Roles(Role.Driver)
    async createContact(@Param('id') id: string,) {
        return this.payoutService.createContact(id)
    }
    
    @Get('/fetchContact/:id')
    async fetchContact(@Param('id') id: string){
        return this.payoutService.fetchContact(id)
    }
    
    @Post('/createFundAccount/:id')
    @Roles(Role.Driver)
    async createFundAccount(@Param('id') id: string, @Body('') bankDetails: any) {
        return this.payoutService.createFundAccount(id, bankDetails)
    }

    @Post('/createPayoutViaBank/:id')
    @Roles(Role.Admin)
    async initiatePayoutBank(@Param('id') id: string, @Body() dto: BankPayoutDTO) {
        return this.payoutService.createPayoutViaBank(dto, id)
    }
    @Post('/createPayoutViaUpi/:id')
    @Roles(Role.Admin)
    async initiatePayoutUpi(@Param('id') id: string, @Body() dto: PayoutDTO) {
        return this.payoutService.createPayoutViaVpa(dto, id)
    }
}

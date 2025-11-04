import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { RideService } from './ride.service';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { RoleGuard } from 'src/common/guards/role/role.guard';
import { User } from 'src/common/decorators/req-user.decorator';
import { GetFareDTO, RequestRideDTO } from 'src/dto/requestRide.dto';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/enum/role.enum';

@Controller('ride')
@UseGuards(AuthGuard, RoleGuard)
export class RideController {
    constructor(
        private rideService: RideService
    ){}

    @Post('/getFares')
    @Roles(Role.User)
    async getFares(
        @User() user: any,
        @Body() dto: GetFareDTO
    ){
        return await this.rideService.getFares(dto, user)
    }
    
    @Post('/requestRide')
    @Roles(Role.User)
    async bookRide(
        @User() user: any,
        @Body() dto: RequestRideDTO
    ){
        return await this.rideService.bookRide(user, dto)
    }

    @Patch('/cancelRide/:id')
    @Roles(Role.User)
    async cancelRide(@Param('id') id: string, @User() user?: any){
        return await this.rideService.cancelRide(id, user)
    }

    @Post('/acceptRide/:rideId')
    @Roles(Role.Driver)
    async assignDriver(@User() user: any,@Param('rideId') rideId: string){
        return await this.rideService.assignDriver(rideId, user.sub)
    }

    @Post('/startRide/:id')
    @Roles(Role.Driver)
    async startRide(@Param('id') id: string){
        return await this.rideService.startRide(id)
    }

    @Post('/completeRide/:id')
    @Roles(Role.Driver)
    async endRide(@Param('id') id: string){
        return await this.rideService.endRide(id)
    }

    @Get('/findDrivers/:rideId')
    @Roles(Role.User)
    async findDriver(@Param('rideId') rideId: string){
        return await this.rideService.findDriver(rideId)
    }

    @Get('/currentDistance/:vehicleType/:lat1/:long1/:lat2/:long2')
    currentdistance(@Param('lat1') lat1: any, @Param('long1') long1: any, @Param('lat2') lat2: any, @Param('long2') long2: any, @Param('vehicleType') vehicleType: any){
        return this.rideService.currentdistance(lat1, long1, lat2, long2, vehicleType)
    }

    @Get('/acceptedRide')
    @Roles(Role.User, Role.Driver)
    async getRide(@User() user: any){
        return await this.rideService.getRide(user.sub)
    }

    @Post('/finalizeEarning/:rideId')
    async finalizeEarningforRide(@Param('rideId') rideId: string, @Body('paymentMethod') paymentMethod: string){
        return await this.rideService.finalizeEarningforRide(rideId, paymentMethod)
    }
}

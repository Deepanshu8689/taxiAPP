import { Injectable } from '@nestjs/common';
import { RideRepository } from './ride.respository';
import { GetFareDTO, RequestRideDTO } from 'src/dto/requestRide.dto';

@Injectable()
export class RideService {
    constructor(
        private rideRepo: RideRepository
    ){}

    async getFares(dto: GetFareDTO, user: any) {
        return this.rideRepo.getFares(dto, user)
    }

    async bookRide(user: any, dto: RequestRideDTO){
        return await this.rideRepo.bookRide(user, dto)
    }

    async cancelRide(id: string, user?: any){
        return await this.rideRepo.cancelRide(id, user)
    }

    async assignDriver(rideId: string, driverId: string){
        return await this.rideRepo.assignDriver(rideId, driverId)
    }

    async startRide(id: string){
        return await this.rideRepo.startRide(id)
    }

    async endRide(id: string){
        return await this.rideRepo.rideComplete(id)
    }

    async findDriver(rideId: string){
        return await this.rideRepo.findDrivers(rideId)
        
    }

    currentdistance(lat1: any, long1: any, lat2: any, long2: any, vehicleType: any){
        return this.rideRepo.currentDistance(lat1, long1, lat2, long2, vehicleType)
    }

    async getRide(id: string){
        return await this.rideRepo.getAcceptedRide(id)
    }

    async finalizeEarningforRide(rideId: string, paymentMethod: string){
        return await this.rideRepo.finalizeEarningforRide(rideId, paymentMethod)
    }
}

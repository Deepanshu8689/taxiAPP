import { Injectable } from '@nestjs/common';
import { DriverRepository } from './driver.repository';
import { VehicleDTO } from 'src/dto/vehicle.dto';
import { UpdateUserDTO } from 'src/dto/updateUser.dto';
import { CommonService } from '../common/common.service';

@Injectable()
export class DriverService {
    constructor(
        private driverRepo: DriverRepository,
        private commonService: CommonService
    ) { }

    async getProfile(user: any) {
        return this.driverRepo.getProfile(user)
    }

    async updateVehicleDetails(user: any, dto: VehicleDTO) {
        return this.driverRepo.updateVehicleDetails(user, dto)
    }

    async updatePassword(user: any, password: string, newPassword: string, confirmNewPassword: string) {
        return this.driverRepo.updatePassword(user, password, newPassword, confirmNewPassword)
    }

    async updateProfile(user: any, dto: UpdateUserDTO) {
        return this.driverRepo.updateProfile(user, dto)
    }

    async updateStatus(user: any, status: string){
        return await this.driverRepo.updateStatus(user, status)
    }

    async updateCurrentLocation(user: any, dto: any) {
        return this.driverRepo.updateCurrentLocation(user, dto)
    }

    async bankDetails(user: any, dto: any) {
        return this.driverRepo.updateBankDetails(dto, user)
    }

    async getVehicle(id: string) {
        return this.driverRepo.getVehicle(id)
    }

}

import { Injectable } from '@nestjs/common';
import { AdminRepository } from './admin.repository';
import { UpdateUserDTO } from 'src/dto/updateUser.dto';

@Injectable()
export class AdminService {
    constructor(
        private adminRepo: AdminRepository
    ) { }

    async getProfile(user: any) {
        return this.adminRepo.getProfile(user)
    }


    async verifyVehicle(id: string) {
        return this.adminRepo.verifyVehicle(id)
    }

    async verifyDriver(id: string) {
        return this.adminRepo.verifyDriver(id)
    }

    async updatePassword(user: any, password: string, newPassword: string, confirmNewPassword: string) {
        return this.adminRepo.updatePassword(user, password, newPassword, confirmNewPassword)
    }

    async updateProfile(user: any, dto: UpdateUserDTO) {
        return this.adminRepo.updateProfile(user, dto)
    }

    async fetchAllUsers() {
        return this.adminRepo.fetchAllUsers()
    }
    async fetchAllDrivers() {
        return this.adminRepo.fetchAllDrivers()
    }

}

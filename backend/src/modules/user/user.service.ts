import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UpdateUserDTO } from 'src/dto/updateUser.dto';
import { LocationDTO } from 'src/dto/location.dto';

@Injectable()
export class UserService {
    constructor(
        private userRepo: UserRepository,
    ){}

    async getProfile(user: any){
        return this.userRepo.getProfile(user)
    }

    // async updatePassword(user: any, password: string, newPassword: string, confirmNewPassword: string){
    //     return this.userRepo.updatePassword(user, password, newPassword, confirmNewPassword)
    // }

    async updateProfile(user: any,dto: UpdateUserDTO){
        return this.userRepo.updateProfile(user, dto)
    }
    
    // async fetchAllDrivers(){
    //     return this.userRepo.fetchAllDrivers()
    // }

    async updateCurrentLocation(user: any, dto: LocationDTO){
        return this.userRepo.updateCurrentLocation(user, dto)
    }

    async getRatings(user: any){
        return this.userRepo.getRatings(user)
    }

}

import { Injectable } from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { LoginDTO } from 'src/dto/login.dto';
import { AdminSignupDTO, SignupDTO } from 'src/dto/signup.dto';
import { User } from 'src/schema/user.schema';

@Injectable()
export class AuthService {
    constructor(
        private authRepo: AuthRepository
    ){}

    async initialAdminSinup(): Promise<void>{
            return await this.authRepo.initialAdminSinup()
        }
    
        async createUser(dto: SignupDTO): Promise<User>{
            return await this.authRepo.userSignUp(dto)
        }
        
        async createAdmin(dto: AdminSignupDTO): Promise<User>{
            return await this.authRepo.createAdmin(dto)
        }
    
        async loginUser(dto: LoginDTO){
            return await this.authRepo.login(dto);
        }

        async logoutUser(res: any, user: any){
            return await this.authRepo.logout(res, user)
        }

        async getFullUser(userId: string){
            return await this.authRepo.getFullUser(userId)
        }

}

import { Body, Controller, Get, Param, Patch, Post, Req, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { OtpSmsService } from '../otp-sms/otp-sms.service';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { RoleGuard } from 'src/common/guards/role/role.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/enum/role.enum';
import { User } from 'src/common/decorators/req-user.decorator';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UpdateUserDTO } from 'src/dto/updateUser.dto';
import { LocationDTO } from 'src/dto/location.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('user')
@UseGuards(AuthGuard, RoleGuard)
@Roles(Role.User)
export class UserController {
    constructor(
        private readonly userService: UserService,
        private otpService: OtpSmsService,
        private cloudinaryService: CloudinaryService
    ) { }

    @Get('/getProfile')
    async getProfile(@User() user: any) {
        return await this.userService.getProfile(user);
    }


    @Post('/sendSms')
    async sendOtpSms(@User() user: any) {
        return await this.otpService.sendOtpSms(user);
    }

    @Post('/verifyPhone')
    async verifyPhone(@User() user: any, @Body() body: any) {
        return await this.otpService.verifyPhone(user, body.sms);
    }

    // @Patch('/updatePassword')
    // async updatePassword(
    //     @User() user: any,
    //     @Body() body: any
    // ) {
    //     return await this.userService.updatePassword(user, body.password, body.newPassword, body.confirmNewPassword)
    // }


    @Patch('/updateProfile')
    @UseInterceptors(
        FileInterceptor('image')
    )
    async updateProfile(
        @User() user: any,
        @Body() dto: UpdateUserDTO,
        @UploadedFile() image: Express.Multer.File
    ) {
        if(image){
            const url = await this.cloudinaryService.uploadImage(image, 'taxi-app')   
            console.log("url: ", url)
            dto.image = url
        }
        return this.userService.updateProfile(user, dto)
    }

    // @Get('/allDrivers')
    // async getAllDrivers() {
    //     return await this.userService.fetchAllDrivers()
    // }

    @Patch('/updateCurrentLocation')
    async updateCurrentLocation(@User() user: any, @Body() dto: LocationDTO) {
        return await this.userService.updateCurrentLocation(user, dto)
    }

    @Get('/getRatings')
    async getRatings(@User() user: any) {
        return await this.userService.getRatings(user)
    }

}


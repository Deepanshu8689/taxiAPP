import { Body, Controller, Get, Patch, Post, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { User } from 'src/common/decorators/req-user.decorator';
import { Roles } from 'src/common/decorators/role.decorator';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { Role } from 'src/enum/role.enum';
import { RoleGuard } from 'src/common/guards/role/role.guard';
import { multerUserConfig, multerVehicleConfig } from 'src/config/multer.config';
import { VehicleDTO } from 'src/dto/vehicle.dto';
import { DriverService } from './driver.service';
import { OtpSmsService } from '../otp-sms/otp-sms.service';
import { UpdateUserDTO } from 'src/dto/updateUser.dto';
import { LocationDTO } from 'src/dto/location.dto';
import { UpdateDriverDTO } from 'src/dto/updateDriver.dto';
import { BankDetailsDTO } from 'src/dto/bankDetails.dto';
import { CloudinaryMulterConfig } from 'src/config/cloudinary.config';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { WalletService } from '../wallet/wallet.service';

@Controller('driver')
@UseGuards(AuthGuard, RoleGuard)
@Roles(Role.Driver)
export class DriverController {
    constructor(
        private driverService: DriverService,
        private otpService: OtpSmsService,
        private cloudinaryService: CloudinaryService,
        private walletService: WalletService
    ) { }

    @Get('/getProfile')
    async getProfile(@User() user: any) {
        return await this.driverService.getProfile(user);
    }

    @Post('/sendOtp')
    async generateOtp(@User() user: any) {
        return await this.otpService.generateOtp(user.emailId);
    }

    @Post('/verifyEmail')
    async verifyOtp(@User() user: any, @Body('otp') otp: string) {
        return await this.otpService.verifyOtp(user.emailId, otp);
    }

    @Post('/sendSms')
    async sendOtpSms(@User() user: any) {
        return await this.otpService.sendOtpSms(user);
    }

    @Post('/verifyPhone')
    async verifyPhone(@User() user: any, @Body('sms') sms: string) {
        return await this.otpService.verifyPhone(user, sms);
    }

    @Patch('/updateVehicle')
    @UseInterceptors(
        FilesInterceptor('files')
    )
    async vechileDetails(
        @User() user: any,
        @Body() dto: VehicleDTO,
        @UploadedFiles() files: Express.Multer.File[]
    ) {

        if(files && files.length > 0){
            const urls = await this.cloudinaryService.uploadMultiple(files, 'taxi-app')
            dto.vehicleImage = urls[0];
            dto.vehicleRC = urls[1];
            dto.vehicleInsurance = urls[2];
        }
        else{
            throw new Error("Please upload vehicle documents")
        }
        
        return this.driverService.updateVehicleDetails(user, dto)
    }

    @Patch('/updatePassword')
    async updatePassword(
        @User() user: any,
        @Body() body: any
    ) {
        return await this.driverService.updatePassword(user, body.password, body.newPassword, body.confirmNewPassword)
    }

    @Patch('/updateProfile')
    @UseInterceptors(
        FilesInterceptor('files')
    )
    async updateProfile(
        @UploadedFiles() files: Express.Multer.File[],
        @User() user: any,
        @Body() dto: UpdateDriverDTO,
    ) {
        console.log("dto: ", dto)

        if(files && files.length > 0){
            const urls = await this.cloudinaryService.uploadMultiple(files, 'taxi-app')
            dto.image = urls[0];
            dto.drivingLicence = urls[1];
        }
        console.log("dto: ", dto)
        return this.driverService.updateProfile(user, dto)
    }

    @Patch('/updateStatus')
    async updateStatus(@User() user: any, @Body('status') status: string){
        return await this.driverService.updateStatus(user, status)
    }

    @Patch('/updateCurrentLocation')
    async updateCurrentLocation(@User() user: any, @Body() dto: LocationDTO){
        return await this.driverService.updateCurrentLocation(user, dto)
    }

    @Patch('/updateBankDetails')
    async bankDetails(@User() user: any, @Body() dto: BankDetailsDTO){
        return await this.driverService.bankDetails(user, dto)
    }

    

}

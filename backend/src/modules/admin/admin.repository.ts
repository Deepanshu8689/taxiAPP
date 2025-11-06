import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { OtpSmsService } from "../otp-sms/otp-sms.service";
import { MailerService } from "@nestjs-modules/mailer";
import { InjectModel } from "@nestjs/mongoose";
import { OTP, OTPDocument } from "src/schema/otp.schema";
import { Model } from "mongoose";
import { Role } from "src/enum/role.enum";
import * as bcrypt from 'bcrypt'
import { UpdateUserDTO } from "src/dto/updateUser.dto";
import { Vehicle, VehicleDocument } from "src/schema/vehicle.schema";
import { User, UserDocument } from "src/schema/user.schema";

@Injectable()
export class AdminRepository {
    constructor(
        private otpService: OtpSmsService,
        private mailerService: MailerService,
        @InjectModel(User.name) private userSchema: Model<UserDocument>,
        @InjectModel(OTP.name) private otpSchema: Model<OTPDocument>,
        @InjectModel(Vehicle.name) private vehicleSchema: Model<VehicleDocument>,
    ) { }
    

    async getProfile(user: any) {

        const profile = await this.userSchema.findById(user.sub)
        if(!profile){
            throw new NotFoundException("Admin not found")
        }
        return profile
    }

    async verifyVehicle(id: string) {
            try {
                const vehicle = await this.vehicleSchema.findById(id);
                vehicle.isVehicleVerified = true;
                await vehicle.save()
                return {
                    message: "Vehicle verified successfully",
                    vehicle
                }
            } catch (error) {
                console.log("error in verifyVehicle: ", error)
            }
        }
    
        async verifyDriver(id: string){
            try {
    
                const driver = await this.userSchema.findById(id);
                if( !driver.drivingExperience || driver.drivingExperience < 2 || !driver.drivingLicence )
                {
                    throw new BadRequestException("Please verify driver first")
                }

                const vehicle = await this.vehicleSchema.findOne({ driver: driver._id })

                if(vehicle.isVehicleVerified === false){
                    throw new BadRequestException("Please verify vehicle first")
                }

                driver.isVerified = true;
                await driver.save()

                return {
                    message: "Driver verified successfully",
                    driver
                }
                
            } catch (error) {
                console.log("error in verifyDriver: ", error)
                throw error
            }
        }
    
        async updatePassword(user: any, password: string, newPassword: string, confirmNewPassword: string) {
            try {
                const loggedInUser = await this.userSchema.findById(user.sub)
                if (!loggedInUser) {
                    throw new NotFoundException('Login again')
                }
    
                if (!newPassword && !confirmNewPassword && !password) {
                    throw new BadRequestException('All fields are required')
                }
    
                if (newPassword !== confirmNewPassword) {
                    throw new BadRequestException('Passwords do not match')
                }
    
                const isMatch = await bcrypt.compare(password, loggedInUser.password)
                if (isMatch) {
                    throw new BadRequestException('Old password is incorrect')
                }

                const isMatchSame = await bcrypt.compare(newPassword, loggedInUser.password)
                if (isMatchSame) {
                    throw new BadRequestException('New password cannot be same as old password')
                }
    
                const hashedPass = await bcrypt.hash(newPassword, 10);
                loggedInUser.password = hashedPass
    
                await loggedInUser.save();
                return {
                    message: "Password updated successfully",
                    loggedInUser
                }
    
            } catch (error) {
                console.log("error in updatePassword: ", error)
                throw error
            }
        }
    
        async updateProfile(user: any, dto: UpdateUserDTO) {
            try {
                const loggedInUser = await this.userSchema.findById(user.sub)
                if (dto.phoneNumber) {
                    const phoneNumber = dto.phoneNumber
                    try {
                        const { savedOtp } = await this.otpService.sendOtpSms(phoneNumber)
                        if (!loggedInUser) {
                            throw new NotFoundException('User not found')
                        }
                        const emailId = loggedInUser.emailId;
    
                        const latestOtp = await this.otpSchema.findOne({ emailId }).sort({ createdAt: -1 });
                        if (!latestOtp) {
                            throw new NotFoundException('Otp not found')
                        }
    
                        if (latestOtp.expiresAt < new Date()) throw new BadRequestException('OTP expired');
                        if (latestOtp.otp !== savedOtp.otp) throw new BadRequestException('Invalid OTP');
    
                        const body = `Your phone number: ${phoneNumber} is verified, Now you can update your phone number!`;
                        await this.otpService.sendSms(phoneNumber, body)
                    } catch (error) {
                        console.log("error in verifying phone number during update: ", error)
                        throw error
                    }
                }
    
                const updateData: any = { ...dto }
    
                if (loggedInUser.role === 'driver') {
                    if (dto.emailId) updateData.isEmailVerified = false
                    if (dto.phoneNumber) updateData.isPhoneVerified = false
                }
    
                const updatedAccount = await this.userSchema.findOneAndUpdate(
                    {emailId: loggedInUser.emailId},
                    updateData,
                    { new: true },
                )
                console.log("updatedAccount: ", updatedAccount)
    
                if (dto.emailId) {
                    await this.mailerService.sendMail({
                        to: user.emailId,
                        subject: 'Email Updated Successfully',
                        text: `Your updated emailId is ${dto.emailId}!`,
                        html: `<h1>Your updated emailId is ${dto.emailId}!
                        All updates now sent to ${dto.emailId}</h1>`
                    })
                }
                return updatedAccount
    
            } catch (error) {
                console.log("error in updateProfile: ", error)
            }
        }
    
        async fetchAllUsers(){
            const users = await this.userSchema.find(
                {role: Role.User}
            )
            return users
        }
    
        async fetchAllDrivers() {
            const drivers = await this.userSchema.find(
                {isVerified: true, role: Role.Driver}
            ).populate('vehicle')
            
            if(drivers.length === 0){
                return{
                    message: "No verified drivers found"
                }
            }
            return drivers
        }


}
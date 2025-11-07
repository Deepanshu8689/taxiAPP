import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as bcrypt from 'bcrypt'
import { OTP, OTPDocument } from "src/schema/otp.schema";
import { MailerService } from "@nestjs-modules/mailer";
import { UpdateUserDTO } from "src/dto/updateUser.dto";
import { OtpSmsService } from "../otp-sms/otp-sms.service";
import { Role } from "src/enum/role.enum";
import { LocationDTO } from "src/dto/location.dto";
import { CommonService } from "../common/common.service";
import { User, UserDocument } from "src/schema/user.schema";

@Injectable()
export class UserRepository {

    constructor(
        private otpService: OtpSmsService,
        private mailerService: MailerService,
        private commonService: CommonService,
        @InjectModel(User.name) private userSchema: Model<UserDocument>,
        @InjectModel(OTP.name) private otpSchema: Model<OTPDocument>,
    ) { }

    async getProfile(user: any) {

        try {
            const profile = await this.userSchema.findById(user.sub)
            if (!profile) {
                throw new NotFoundException("User not found")
            }
            return profile
        } catch (error) {
            console.log("error in getProfile: ", error)
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
            console.log("dto in repo: ", dto)
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
                { emailId: loggedInUser.emailId },
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
            throw error
        }
    }


    async fetchAllDrivers() {
        const drivers = await this.userSchema.find(
            { isVerified: true, role: Role.Driver }
        ).select('firstName image lastName drivingExperience emailId phoneNumber age vehicle.vehicleName vehicle.vehicleNumber vehicle.vehicleType vehicle.vehicleColor vehicle.vehicleImage')

        if (drivers.length === 0) {
            return {
                message: "No verified drivers found"
            }
        }

        return drivers
    }

    async updateCurrentLocation(user: any, dto: LocationDTO) {
        try {
            const { latitude, longitude } = dto
            const getCurrentLocation = await this.commonService.currentLocation(user, dto)

            const updatedLocation = await this.userSchema.findOneAndUpdate(
                { _id: user.sub },
                {
                    latitude,
                    longitude,
                    currentLocation: getCurrentLocation
                },
                {
                    new: true
                }
            )
            return updatedLocation

        } catch (error) {
            console.log("error in updateCurrentLocation: ", error)
            throw error
        }
    }
}
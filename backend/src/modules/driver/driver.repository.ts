import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { OtpSmsService } from "../otp-sms/otp-sms.service";
import { MailerService } from "@nestjs-modules/mailer";
import { InjectModel } from "@nestjs/mongoose";
import { OTP, OTPDocument } from "src/schema/otp.schema";
import { Model } from "mongoose";
import { Role } from "src/enum/role.enum";
import { VehicleDTO } from "src/dto/vehicle.dto";
import * as bcrypt from 'bcrypt'
import { UpdateUserDTO } from "src/dto/updateUser.dto";
import { LocationDTO } from "src/dto/location.dto";
import { CommonService } from "../common/common.service";
import { Vehicle, VehicleDocument } from "src/schema/vehicle.schema";
import { User, UserDocument } from "src/schema/user.schema";
import { BankDetailsDTO } from "src/dto/bankDetails.dto";
import { PayoutService } from "../payout/payout.service";

@Injectable()
export class DriverRepository {

    constructor(
        private otpService: OtpSmsService,
        private mailerService: MailerService,
        private commonService: CommonService,
        private payoutService: PayoutService,
        @InjectModel(User.name) private userSchema: Model<UserDocument>,
        @InjectModel(OTP.name) private otpSchema: Model<OTPDocument>,
        @InjectModel(Vehicle.name) private vehicleSchema: Model<VehicleDocument>,
    ) {

    }

    async getProfile(user: any) {

        const profile = await this.userSchema.findById(user.sub)
        if (!profile) {
            throw new NotFoundException("Driver not found")
        }
        return profile
    }

    async updateVehicleDetails(user: any, dto: VehicleDTO) {
        try {
            // console.log("dto: ", dto)
            const driverDetails = await this.userSchema.findOne({ _id: user.sub, isEmailVerified: true, isPhoneVerified: true })
            if (!driverDetails) {
                throw new NotFoundException("Verify your email and phone number first")
            }

            const driverId = driverDetails._id

            const existingVehicle = await this.vehicleSchema.findOne({ driver: driverId })
            if (existingVehicle) {
                await this.vehicleSchema.updateOne({ _id: existingVehicle._id }, { $set: { ...dto } })
                return {
                    message: "Vehicle details updated successfully",
                    vehicle: existingVehicle
                }
            }

            if (driverDetails.isEmailVerified && driverDetails.isPhoneVerified) {
                const vehicle = new this.vehicleSchema({
                    ...dto,
                    driver: driverId
                })
                await vehicle.save()
                await this.userSchema.findByIdAndUpdate({ _id: driverId }, { $set: { vehicle: vehicle._id } }, { new: true })

                return {
                    message: "Vehicle details updated successfully",
                    driverDetails
                }

            }

        } catch (error) {
            console.log("error in updateVehicleDetails: ", error)
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

    async updateStatus(user: any, status: string) {
        try {

            const loggedInDriver = await this.userSchema.findById(user.sub)
            if (!loggedInDriver) {
                throw new NotFoundException('Driver not found')
            }
            loggedInDriver.status = status
            await loggedInDriver.save()
            return {
                message: "Status updated successfully",
                loggedInDriver
            }

        } catch (error) {
            console.log("error in updateStatus: ", error)
            throw error
        }
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

    async updateBankDetails(dto: BankDetailsDTO, user: any) {
        try {

            const driver = await this.userSchema.findById(user.sub);

            let contactId = driver.razorpayContactId;
            if (!contactId) {
                const contact = await this.payoutService.createContact(user.sub);
                contactId = contact.id;
                driver.razorpayContactId = contactId;
            }

            let fundAccountId = driver.razorpayFundAccountId;
            if (!fundAccountId) {
                const fund = await this.payoutService.createFundAccount(contactId, dto);
                fundAccountId = fund.id;
                driver.razorpayFundAccountId = fundAccountId;
            }
            
            await driver.save();

            return driver
        } catch (error) {
            console.log("error in updateBankDetails: ", error.response?.data || error)
            throw error
        }

    }

}
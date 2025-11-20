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
import { Ride, RideDocument } from "src/schema/ride.schema";
import { RideStatus } from "src/enum/rideStatus.enum";

@Injectable()
export class AdminRepository {
    constructor(
        private otpService: OtpSmsService,
        private mailerService: MailerService,
        @InjectModel(User.name) private userSchema: Model<UserDocument>,
        @InjectModel(Ride.name) private rideSchema: Model<RideDocument>,
        @InjectModel(OTP.name) private otpSchema: Model<OTPDocument>,
        @InjectModel(Vehicle.name) private vehicleSchema: Model<VehicleDocument>,
    ) { }


    async getProfile(user: any) {

        const profile = await this.userSchema.findById(user.sub)
        if (!profile) {
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

    async verifyDriver(id: string) {
        try {

            const driver = await this.userSchema.findById(id);
            if (driver.drivingExperience < 2 && !driver.drivingLicence) {
                throw new BadRequestException("Please verify driver first")
            }

            const vehicle = await this.vehicleSchema.findOne({ driver: driver._id })

            if (vehicle.isVehicleVerified === false) {
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

    // async updatePassword(user: any, password: string, newPassword: string, confirmNewPassword: string) {
    //     try {
    //         const loggedInUser = await this.userSchema.findById(user.sub)
    //         if (!loggedInUser) {
    //             throw new NotFoundException('Login again')
    //         }

    //         if (!newPassword && !confirmNewPassword && !password) {
    //             throw new BadRequestException('All fields are required')
    //         }

    //         if (newPassword !== confirmNewPassword) {
    //             throw new BadRequestException('Passwords do not match')
    //         }

    //         const isMatch = await bcrypt.compare(password, loggedInUser.password)
    //         if (!isMatch) {
    //             throw new BadRequestException('Old password is incorrect')
    //         }

    //         const isMatchSame = await bcrypt.compare(newPassword, loggedInUser.password)
    //         if (isMatchSame) {
    //             throw new BadRequestException('New password cannot be same as old password')
    //         }

    //         const hashedPass = await bcrypt.hash(newPassword, 10);
    //         loggedInUser.password = hashedPass

    //         await loggedInUser.save();
    //         return {
    //             message: "Password updated successfully",
    //             loggedInUser
    //         }

    //     } catch (error) {
    //         console.log("error in updatePassword: ", error)
    //         throw error
    //     }
    // }

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

                    const latestOtp = await this.otpSchema.findOne({ phoneNumber }).sort({ createdAt: -1 });
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

            

            const updatedAccount = await this.userSchema.findOneAndUpdate(
                { phoneNumber: loggedInUser.phoneNumber },
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

    async fetchAllUsers() {
        try {
            const users = await this.userSchema.find(
                { role: Role.User }
            ).populate('completedRides')
            return users
        } catch (error) {
            console.log("error in fetchAllUsers: ", error)
            throw error
        }
    }

    async fetchAllDrivers(filter?: string) {
        try {
            console.log("filter: ", filter)

            const query: any = {role: Role.Driver};
            switch (filter) {
                case 'verified':
                    query.isVerified = true;
                    query.isSuspended = false;
                    break;
                case 'pending':
                    query.isVerified = false;
                    query.isSuspended = false;
                    break;
                case 'suspended':
                    query.isSuspended = true;
                    break;
                default:
                    // 'all' – no extra conditions
                    break;
            }
            console.log("query: ", query)


            const drivers = await this.userSchema.find(query).populate('vehicle completedRides')
            console.log("drivers: ", drivers)

            if (drivers.length === 0) {
                return {
                    message: "No verified drivers found"
                }
            }
            return drivers
        } catch (error) {
            console.log("error in fetchAllDrivers: ", error)
            throw error
        }
    }

    async getAllRides(status?: string) {
        try {
            const filter = status ? { status } : {};
            const rides = await this.rideSchema.find(filter).populate({
                path: 'rider',
                model: User.name
            }).populate({
                path: 'driver',
                model: User.name
            }).populate({
                path: 'vehicle',
                model: Vehicle.name
            }).sort({ createdAt: -1 })
            return rides
        } catch (error) {
            console.log("error in getAllRides: ", error)
            throw error
        }
    }

    async suspendDriver(id: string) {
        try {
            const suspendedDriver = await this.userSchema.findOneAndUpdate(
                { _id: id },
                {
                    isSuspended: true,
                    isVerified: false
                },
                { new: true }
            )

            return suspendedDriver
        } catch (error) {
            console.log("error in suspendDriver: ", error)
            throw error
        }
    }

    async getAnalytics() {
        try {
            let totalUsers = await this.userSchema.countDocuments({ role: Role.User })
            let totalDrivers = await this.userSchema.countDocuments({ role: Role.Driver })
            const totalRides = await this.rideSchema.countDocuments()
            const completedRides = await this.rideSchema.countDocuments({ status: RideStatus.Completed })


            const revenue = await this.rideSchema.aggregate([
                { $match: { status: RideStatus.Completed } },
                {
                    $group: {
                        _id: null,
                        totalEarnings: { $sum: '$actualFare' },
                        totalRides: { $sum: 1 }
                    }
                }
            ])

            const totalEarnings = revenue[0]?.totalEarnings || 0

            return {
                totalUsers,
                totalDrivers,
                totalRides,
                completedRides,
                totalEarnings
            }

        } catch (error) {
            console.log("error in getAnalytics: ", error)
            throw error
        }
    }

    async getEarnings() {
        try {

            const driverEarnings = await this.rideSchema.aggregate([
                { $match: { status: RideStatus.Completed } },
                {
                    $group: {
                        _id: '$driver',
                        totalEarned: { $sum: '$actualFare' },
                        rideCounts: { $sum: 1 }
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'driverInfo'
                    }
                },
                {
                    $unwind: '$driverInfo'
                },
                {
                    $project: {
                        driverName: {
                            $concat: ['$driverInfo.firstName', ' ', '$driverInfo.lastName']
                        },
                        totalEarned: 1,
                        rideCounts: 1
                    }
                }
            ])

            console.log("driverEarnings: ", driverEarnings)
            return driverEarnings;

        } catch (error) {
            console.log("error in getEarnings: ", error)
            throw error
        }
    }
}
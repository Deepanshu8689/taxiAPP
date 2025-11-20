import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as bcrypt from 'bcrypt'
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { Role } from "src/enum/role.enum";
import { LoginDTO } from "src/dto/login.dto";
import { AdminSignupDTO, SignupDTO } from "src/dto/signup.dto";
import { User, UserDocument } from "src/schema/user.schema";
import { Ride, RideDocument } from "src/schema/ride.schema";
import { RideStatus } from "src/enum/rideStatus.enum";
import { OTP, OTPDocument, OtpSchema } from "src/schema/otp.schema";

@Injectable()
export class AuthRepository {

    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
        @InjectModel(User.name) private userSchema: Model<UserDocument>,
        @InjectModel(OTP.name) private otpSchema: Model<OTPDocument>,
        @InjectModel(Ride.name) private rideSchema: Model<RideDocument>,
    ) { }

    async initialAdminSinup(): Promise<void> {
        try {
            const existingAdmin = await this.userSchema.findOne({ role: Role.Admin })
            if (existingAdmin) {
                console.log('Admin already exists — skipping bootstrap.')
                return
            }

            const emailId = this.configService.get<string>('ADMIN_EMAIL');
            const password = this.configService.get<string>('ADMIN_PASS');
            const phoneNumber = this.configService.get<string>('ADMIN_PHONE');
            const firstName = this.configService.get<string>('ADMIN_FIRSTNAME');
            const lastName = this.configService.get<string>('ADMIN_LASTNAME');
            const age = Number(this.configService.get<string>('ADMIN_AGE'));


            if (!emailId || !password || !phoneNumber || !firstName || !lastName || !age) {
                throw new BadRequestException('Admin details not found')
            }

            const hashedPass = await bcrypt.hash(password, 10);
            const admin = await this.userSchema.create({
                emailId,
                password: hashedPass,
                firstName,
                lastName,
                phoneNumber,
                age,
                role: Role.Admin
            })
            console.log(`✅ Default admin created: ${admin}`)
        } catch (error) {
            console.log("error in initial admin: ", error)
            throw error
        }
    }

    async userSignUp(dto: SignupDTO): Promise<User> {
        try {
            const { firstName, lastName, phoneNumber, emailId, age, role } = dto;

            if(!phoneNumber){
                throw new NotFoundException('Phone number is required')
            }

            const existingUser = await this.userSchema.findOne({ phoneNumber })
            if (existingUser) {
                throw new BadRequestException('User already exists')
            }

            const user = await this.userSchema.create(dto)

            return user;

        } catch (error) {
            console.log("error in signup: ", error)
            throw new BadRequestException(error.message)
        }
    }

    async createAdmin(dto: AdminSignupDTO): Promise<User> {
        try {
            const { emailId, firstName, lastName, phoneNumber, age } = dto;

            if (!emailId || !firstName || !lastName || !phoneNumber || !age ) {
                throw new Error('All fields are required')
            }

            const existingUser = await this.userSchema.findOne({ phoneNumber })
            if (existingUser) {
                throw new Error('User already exists')
            }

            const admin = await this.userSchema.create({
                emailId,
                firstName,
                lastName,
                phoneNumber,
                age,
                role: Role.Admin
            })

            return admin;

        } catch (error) {
            console.log("error in signup: ", error)

        }
    }

    async login(dto: LoginDTO): Promise<{ accessToken: string, cookie: any, user: any }> {
        try {

            const { phoneNumber, otp } = dto;
            if (!phoneNumber || !otp) {
                throw new Error('All fields are required')
            }

            const user = await this.userSchema.findOne({ phoneNumber })
            if (!user) {
                throw new NotFoundException('User not found, Please signup first')
            }

            const latestOtp = await this.otpSchema.findOne({ phoneNumber }).sort({ createdAt: -1 });
            if (!latestOtp) {
                throw new NotFoundException('Otp not found')
            }

            if(otp !== latestOtp.otp){
                throw new BadRequestException('Invalid OTP')
            }

            const payload = {
                sub: user._id,
                emailId: user.emailId,
                role: user.role,
                phoneNumber: user.phoneNumber
            }

            const ride = await this.rideSchema.findOne({ driverId: user._id, $or: [{status: RideStatus.Accepted}, {status: RideStatus.Started}] })

            if (user.role === Role.Driver && ride) {
                user.status = 'busy';
                await user.save();
            }

            else if (user.role === Role.Driver && !ride) {
                user.status = 'available';
                await user.save();
            }

            const token = await this.jwtService.signAsync(payload)
            const cookie = {
                name: 'token',
                value: token,
                options: {
                    httpOnly: true,
                    secure: false,
                    maxAge: 24 * 60 * 60 * 1000
                }
            }
            return {
                accessToken: token,
                cookie,
                user
            }

        } catch (error) {
            console.log("error in login: ", error)
        }
    }

    async logout(res: any, user: any) {
        if (user.role === Role.Driver) {
            const driver = await this.userSchema.findOne({ _id: user.sub })
            if (!driver) {
                throw new NotFoundException('Driver not found')
            }
            if (user.status !== 'busy') {
                driver.status = 'offline';
                await driver.save();
            }
        }
        return res.cookie('token', null, {
            expires: new Date(Date.now()),
        }).json({ message: "Logout Successfull" })
    }


    async getFullUser(userId: string) {
        try {
            const user = await this.userSchema.findById(userId)
            if (!user) {
                throw new NotFoundException('User not found');
            }
            return user;
        } catch (error) {
            console.log("error in getFullUser: ", error);
            throw error;
        }
    }

}
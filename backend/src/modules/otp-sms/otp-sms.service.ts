import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OTP, OTPDocument } from 'src/schema/otp.schema';
import * as otpGenerator from 'otp-generator'
import { Twilio } from 'twilio';
import { ConfigService } from '@nestjs/config';
import { User, UserDocument } from 'src/schema/user.schema';

@Injectable()
export class OtpSmsService {


    private client: Twilio
    private logger = new Logger(OtpSmsService.name)
    constructor(
        private mailerService: MailerService,
        @InjectModel(User.name) private userSchema: Model<UserDocument>,
        @InjectModel(OTP.name) private otpSchema: Model<OTPDocument>,
        private configService: ConfigService,
    ) {

        const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
        const auth_token = this.configService.get<string>('TWILIO_AUTH_TOKEN');
        this.client = new Twilio(
            accountSid,
            auth_token
        )
    }

    async sendSms(phoneNumber: string, body: string) {
        // console.log("phoneNumber: ", process.env.PHONE_NUMBER)
        if (!process.env.PHONE_NUMBER) {
            throw new BadRequestException('Twilio phone number not found')
        }

        try {
            // console.log("body: ", body)
            const message = await this.client.messages.create({
                body,
                from: process.env.PHONE_NUMBER,
                to: phoneNumber
            })
            console.log("message: ", message.sid)
            return message
        } catch (error) {
            console.log('Failed to send Sms: ', error)
            throw new BadRequestException('Failed to send SMS. Check Twilio credentials.');
        }
    }

    // generate otp for verification of driver's email
    async generateOtp(emailId: string) {
        try {
            const generatedOtp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                specialChars: false,
                digits: true,
                lowerCaseAlphabets: false,
            })
            console.log("otp: ", generatedOtp)

            const savedOtp = await this.otpSchema.create({
                emailId,
                otp: generatedOtp,
                expiresAt: new Date(Date.now() + 2 * 60 * 1000)
            })

            await this.mailerService.sendMail({
                to: emailId,
                subject: 'OTP Verification Mail',
                text: `Your otp is ${generatedOtp}`,
                context: {
                    otp: generatedOtp
                },
                html: `<h1>Your OTP is: ${generatedOtp}</h1>
                Expires on: ${savedOtp.expiresAt}
            `
            })

            return {
                message: `Otp generated successfully`,
                generatedOtp
            }

        } catch (error) {
            console.log("error in generateOtp: ", error)
            throw error
        }
    }

    async verifyOtp(emailId: string, otp: string) {
        try {
            const latestOtp = await this.otpSchema.findOne({ emailId }).sort({ createdAt: -1 });
            if (!latestOtp) {
                throw new NotFoundException('Otp not found')
            }

            if (latestOtp.expiresAt < new Date()) throw new BadRequestException('OTP expired');
            if (latestOtp.otp !== otp) throw new BadRequestException('Invalid OTP');

            await this.mailerService.sendMail({
                to: emailId,
                subject: 'Email Verified',
                text: `Your email: ${emailId} is verified, login and enjoy!`,
                html: `Your email: ${emailId} is verified, login and enjoy!`
            })
            const driver = await this.userSchema.findOneAndUpdate(
                { emailId },
                { isEmailVerified: true },
                { new: true }
            )

            return {
                message: `Email Verified Successfully`,
                driver
            }

        } catch (error) {
            console.log("error in verifyOtp: ", error)
            throw error
        }
    }

    // for user and driver
    async sendOtpSms(user: any) {
        try {
            const generatedOtp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                specialChars: false,
                digits: true,
                lowerCaseAlphabets: false,
            })
            // console.log("otp: ", generatedOtp)

            const savedOtp = await this.otpSchema.create({
                emailId: user.emailId,
                otp: generatedOtp,
                expiresAt: new Date(Date.now() + 2 * 60 * 1000)
            })

            const body = `Your OTP is ${generatedOtp}. It will expire in 2 minutes.`;

            await this.sendSms(user.phoneNumber, body);

            return {
                message: `Otp sent on sms: ${generatedOtp}`,
                savedOtp
            }

        } catch (error) {
            console.log("error in sendOtpSms: ", error)
            throw error
        }

    }

    async verifyPhone(user: any, sms: string) {
        try {

            const emailId = user.emailId

            const latestOtp = await this.otpSchema.findOne({ emailId }).sort({ createdAt: -1 });
            if (!latestOtp) {
                throw new NotFoundException('Otp not found')
            }

            if (latestOtp.expiresAt < new Date()) throw new BadRequestException('OTP expired');
            if (latestOtp.otp !== sms) throw new BadRequestException('Invalid OTP');

            const body = `Your phone number: ${user.phoneNumber} is verified, login and enjoy!`;
            await this.sendSms(user.phoneNumber, body)

            await this.mailerService.sendMail({
                to: emailId,
                subject: 'Phone Number Verified',
                text: `Your number: ${user.phoneNumber} is verified, login and enjoy!`,
                html: `Your number: ${user.phoneNumber} is verified, login and enjoy!`
            })

            // update driver's phone number aND mark verified
            await this.userSchema.findOneAndUpdate(
                { emailId },
                { isPhoneVerified: true },
                { new: true }
            )

            return {
                message: `Phone Number Verified Successfully`,
            }

        } catch (error) {
            console.log("error in verifyPhone: ", error)
            throw error
        }
    }
}

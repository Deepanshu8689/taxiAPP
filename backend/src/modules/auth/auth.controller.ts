import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { OtpSmsService } from '../otp-sms/otp-sms.service';
import { RoleGuard } from 'src/common/guards/role/role.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/enum/role.enum';
import { LoginDTO } from 'src/dto/login.dto';
import { Response } from 'express';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { User } from 'src/common/decorators/req-user.decorator';
import { AdminSignupDTO, SignupDTO } from 'src/dto/signup.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private otpService: OtpSmsService
    ) { }

    @Post('/send-otp')
    async sendOtpSms(@Body() body: any) {
        console.log("body: ", body)
        return await this.otpService.sendOtpSms(body.phoneNumber);
    }

    @Post('/verify-otp')
    async verifyPhone(@Body() body: any) {
        return await this.otpService.verifyPhone(body.phoneNumber, body.otp);
    }

    @Post('/signup')
    async createUser(
        @Body() dto: SignupDTO,
    ) {
        return await this.authService.createUser(dto);
    }


    @Post('/signupAdmin')
    @UseGuards(RoleGuard)
    @Roles(Role.Admin)
    async createAdmin(
        @Body() dto: AdminSignupDTO,
    ) {
        return await this.authService.createAdmin(dto);
    }

    @Post('/login')
    async loginUser(
        @Body() dto: LoginDTO,
        @Res() res: Response
    ) {
        const { accessToken, cookie, user } = await this.authService.loginUser(dto);
        res.cookie(cookie.name, cookie.value, cookie.options)

        return res.json({
            success: true,
            message: 'Login Successfull',
            accessToken,
            user
        })
    }

    @Post('/logout')
    @UseGuards(AuthGuard)
    async logout(@Res() res: Response, @User() user: any) {
        return await this.authService.logoutUser(res, user)
        
    }

    @Get('me')
    @UseGuards(AuthGuard)
    getProfile(@User() user: any) {
        const fullUser = this.authService.getFullUser(user.sub);
        return fullUser;
    }

}

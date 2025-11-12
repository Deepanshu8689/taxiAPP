import { Module, OnModuleInit } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from './user.repository';
import { OTP, OtpSchema } from 'src/schema/otp.schema';
import { MailerModule } from '@nestjs-modules/mailer';
import { OtpSmsService } from '../otp-sms/otp-sms.service';
import { OtpSmsModule } from '../otp-sms/otp-sms.module';
import { CommonService } from '../common/common.service';
import { User, UserSchema } from 'src/schema/user.schema';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: OTP.name, schema: OtpSchema },
    ]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        global: true,
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN')
        }
      })
    }),
    OtpSmsModule,
  ],
  providers: [UserService, CommonService, CloudinaryService, ConfigService, UserRepository, MailerModule, OtpSmsService],
  controllers: [UserController]
})
export class UserModule { }

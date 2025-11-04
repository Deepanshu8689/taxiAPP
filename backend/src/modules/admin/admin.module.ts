import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AdminRepository } from './admin.repository';
import { OtpSmsModule } from '../otp-sms/otp-sms.module';
import { MongooseModule } from '@nestjs/mongoose';
import { OTP, OtpSchema } from 'src/schema/otp.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Vehicle, VehicleSchema } from 'src/schema/vehicle.schema';
import { User, UserSchema } from 'src/schema/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: OTP.name, schema: OtpSchema },
      { name: Vehicle.name, schema: VehicleSchema }
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
    OtpSmsModule
  ],
  providers: [AdminService, AdminRepository],
  controllers: [AdminController]
})
export class AdminModule { }

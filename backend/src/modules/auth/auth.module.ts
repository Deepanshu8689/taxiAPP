import { Module, OnModuleInit } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { OTP, OtpSchema } from 'src/schema/otp.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthRepository } from './auth.repository';
import { OtpSmsModule } from '../otp-sms/otp-sms.module';
import { Vehicle, VehicleSchema } from 'src/schema/vehicle.schema';
import { User, UserSchema } from 'src/schema/user.schema';
import { Ride, RideSchema } from 'src/schema/ride.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Ride.name, schema: RideSchema },
      { name: OTP.name, schema: OtpSchema },
      { name: Vehicle.name, schema: VehicleSchema },
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
  providers: [AuthService, AuthRepository],
  controllers: [AuthController]
})
export class AuthModule implements OnModuleInit {
  constructor(private authService: AuthService) { }

  async onModuleInit() {
    return await this.authService.initialAdminSinup()
  }
}

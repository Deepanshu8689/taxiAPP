import { Module } from '@nestjs/common';
import { DriverService } from './driver.service';
import { DriverController } from './driver.controller';
import { DriverRepository } from './driver.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { OTP, OtpSchema } from 'src/schema/otp.schema';
import { OtpSmsModule } from '../otp-sms/otp-sms.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CommonService } from '../common/common.service';
import { Vehicle, VehicleSchema } from 'src/schema/vehicle.schema';
import { User, UserSchema } from 'src/schema/user.schema';
import { PayoutService } from '../payout/payout.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { WalletService } from '../wallet/wallet.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
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
  providers: [DriverService, DriverRepository, WalletService, CommonService, PayoutService, CloudinaryService],
  controllers: [DriverController]
})
export class DriverModule { }

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { OTP, OtpSchema } from 'src/schema/otp.schema';
import { OtpSmsService } from './otp-sms.service';
import { User, UserSchema } from 'src/schema/user.schema';
@Module({
    imports: [
        ConfigModule,
        MongooseModule.forFeature([
      { name: OTP.name, schema: OtpSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [OtpSmsService],
  exports: [OtpSmsService],
})
export class OtpSmsModule {}

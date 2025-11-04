import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MailerModule } from '@nestjs-modules/mailer';
import { AuthModule } from './modules/auth/auth.module';
import { DriverModule } from './modules/driver/driver.module';
import { AdminModule } from './modules/admin/admin.module';
import { NotificationController } from './modules/notification/notification.controller';
import { PaymentController } from './modules/payment/payment.controller';
import { RideModule } from './modules/ride/ride.module';
import { CommonService } from './modules/common/common.service';
import { WalletModule } from './modules/wallet/wallet.module';
import { PayoutModule } from './modules/payout/payout.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    UserModule,
    MongooseModule.forRoot(process.env.DB_URL),
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST,
        port: 587,
        secure: false,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS
        }
      },
      defaults: {
        from: ` "No Reply" <${process.env.MAIL_USER}>`
      }
    }),
    AuthModule,
    DriverModule,
    AdminModule,
    RideModule,
    WalletModule,
    PayoutModule,
    
  ],
  controllers: [AppController, NotificationController, PaymentController],
  providers: [AppService, CommonService],
})
export class AppModule {}

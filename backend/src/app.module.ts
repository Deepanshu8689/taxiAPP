import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MailerModule } from '@nestjs-modules/mailer';
import { AuthModule } from './modules/auth/auth.module';
import { DriverModule } from './modules/driver/driver.module';
import { AdminModule } from './modules/admin/admin.module';
import { NotificationController } from './modules/notification/notification.controller';
import { RideModule } from './modules/ride/ride.module';
import { CommonService } from './modules/common/common.service';
import { WalletModule } from './modules/wallet/wallet.module';
import { PayoutModule } from './modules/payout/payout.module';
import { PaymentModule } from './modules/payment/payment.module';
import { SocketModule } from './modules/socket/socket.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { v2 as cloudinary } from 'cloudinary';
import { ChatModule } from './modules/chat/chat.module';
import { NotificationModule } from './modules/notification/notification.module';
import { RatingsModule } from './modules/ratings/ratings.module';
import { AppController } from './app.controller';
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
    PaymentModule,
    SocketModule,
    CloudinaryModule,
    ChatModule,
    NotificationModule,
    RatingsModule,
  ],
  controllers: [AppController, NotificationController],
  providers: [AppService, CommonService],
})
export class AppModule {
  constructor(){
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    })
    console.log("cloudinary Initialized")
  }
}

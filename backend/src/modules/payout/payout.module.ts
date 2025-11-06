import { Module } from '@nestjs/common';
import { PayoutService } from './payout.service';
import { PayoutController } from './payout.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schema/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
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
  ],
  providers: [PayoutService],
  controllers: [PayoutController]
})
export class PayoutModule { }


// imports: [
//         MongooseModule.forFeature([
//             { name: Payment.name, schema: PaymentSchema },
//             { name: User.name, schema: UserSchema },
//         ]),
//     ],
//     controllers: [PaymentController],
//     providers: [PaymentService],



// cont
// constructor(
//         private paymentService: PaymentService
//     ){}

//     @Post('/create-order')
//     async createOrder(@Body() amount: number, @User() user: any){
//         return this.paymentService.createOrder(amount, user)
//     }
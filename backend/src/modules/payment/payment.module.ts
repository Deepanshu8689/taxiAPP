import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from 'src/schema/payment.schema';
import { User, UserSchema } from 'src/schema/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: Payment.name, schema: PaymentSchema},
      {name: User.name, schema: UserSchema}
    ])
  ],
  providers: [PaymentService],
  controllers: [PaymentController]
})
export class PaymentModule {}

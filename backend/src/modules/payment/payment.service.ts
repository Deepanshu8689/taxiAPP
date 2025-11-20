import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Razorpay from 'razorpay';
import { Payment, PaymentDocument } from 'src/schema/payment.schema';
import { User, UserDocument } from 'src/schema/user.schema';

@Injectable()
export class PaymentService {

    private razorpay: any
    constructor(
        @InjectModel(User.name) private userSchema: Model<UserDocument>,
        @InjectModel(Payment.name) private paymentSchema: Model<PaymentDocument>,
        private readonly configService: ConfigService,
    ) {
        this.razorpay = new Razorpay({
            key_id: this.configService.get<string>('RAZORPAY_KEY_ID'),
            key_secret: this.configService.get<string>('RAZORPAY_KEY_SECRET'),
        })
    }

    async createOrder(amount: number, user: any) {
        try {

            const userData = await this.userSchema.findById(user.sub);
            if (!userData) {
                throw new Error("User not found");
            }

            const order = await this.razorpay.orders.create({
                amount: amount * 100,
                currency: "INR",
                receipt: `receipt_order_${Math.random().toString(36).substring(2, 15)}`,
                notes: {
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    phoneNumber: user.phoneNumber,
                }
            })

            if (!order) {
                throw new Error("Order creation failed")
            }

            const payment = this.paymentSchema.create({
                orderId: order.id,
                userId: userData._id,
                status: order.status,
                amount: order.amount,
                currency: order.currency,
                receipt: order.receipt,
                notes: order.notes
            })

            return {
                order,
                key: this.configService.get<string>('RAZORPAY_KEY_ID')
            }

        } catch (error) {
            console.log("error in createOrder: ", error)
            throw error
        }
    }
}

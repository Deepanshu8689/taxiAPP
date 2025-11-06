import { Post } from "@nestjs/common";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types, Schema as MongooseSchema } from "mongoose";


@Schema({timestamps: true})
export class Payment {
    @Prop({required: true})
    orderId: string

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId

    @Prop()
    paymentId: string

    @Prop({required: true})
    status: string

    @Prop({required: true})
    amount: number

    @Prop({required: true})
    currency: string

    @Prop({required: true})
    receipt: string

    @Prop({
        type: MongooseSchema, required: true
    })
    notes: {firstName: string; lastName: string; emailId: string;}
}

export type PaymentDocument = Payment & Document
export const PaymentSchema = SchemaFactory.createForClass(Payment)
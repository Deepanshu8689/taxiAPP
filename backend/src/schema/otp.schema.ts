import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({timestamps: true})
export class OTP{
    @Prop({required: true})
    phoneNumber: string

    @Prop()
    emailId?: string

    @Prop({required: true})
    otp: string

    @Prop({required: true})
    expiresAt: Date
}

export type OTPDocument = OTP & Document

export const OtpSchema = SchemaFactory.createForClass(OTP)
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Role } from "src/enum/role.enum";
import { Vehicle } from "./vehicle.schema";
import { Ride } from "./ride.schema";


@Schema({ timestamps: true })
export class User {
    @Prop({ unique: true })
    emailId: string

    @Prop({ required: true }) // , unique: true
    phoneNumber: string

    @Prop({ required: true })
    password: string

    @Prop({ required: true })
    firstName: string

    @Prop({ required: true })
    lastName: string

    @Prop()
    image: string

    @Prop({type: Number, required: true })
    age: number

    @Prop({
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
    })
    locationType: string

    @Prop()
    latitude: number

    @Prop()
    longitude: number

    @Prop()
    currentLocation: string

    @Prop({ enum: Role, default: Role.User })
    role: string

    // driver details
    @Prop()
    drivingLicence: string

    @Prop()
    drivingExperience: number

    @Prop({ required: true, enum: ["available", "busy", "offline"], default: "offline" })
    status: string

    @Prop({ type: Types.ObjectId, ref: 'Vehicle' })
    vehicle: Vehicle

    @Prop({ required: true, default: false })
    isVerified: boolean

    @Prop({ default: false })
    isEmailVerified: boolean

    @Prop({ default: false })
    isPhoneVerified: boolean

    @Prop({ type: Number, default: 0 })
    totalEarnings: number; // driver lifetime net take-home

    @Prop({ type: Number, default: 0 })
    availableBalance: number; // money available for withdrawal/payout

    @Prop({ type: Number, default: 0 })
    pendingBalance: number; // sums of earnings still pending (optional)


    @Prop({ type: [{ type: Types.ObjectId, ref: 'Ride' }], required: true })
    completedRides: Ride[]

    @Prop() razorpayContactId?: string;

    @Prop() razorpayFundAccountId?: string

    @Prop({ type: [{type: Types.ObjectId, ref:  'Order'}], required: true })
    orderId: Types.ObjectId[]

    @Prop()
    socketId: string
}

export type UserDocument = User & Document
export const UserSchema = SchemaFactory.createForClass(User)


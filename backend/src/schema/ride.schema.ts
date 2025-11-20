import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { RideStatus } from "src/enum/rideStatus.enum";
import { Rating } from "./rating.schema";
import { Vehicle } from "./vehicle.schema";
import { User } from "./user.schema";

@Schema({ timestamps: true })
export class Ride {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    rider: User

    @Prop({ type: Types.ObjectId, ref: 'Driver', default: null })
    driver?: User

    @Prop({ type: Types.ObjectId, ref: 'Vehicle', default: null })
    vehicle?: Vehicle | Types.ObjectId

    @Prop({ required: true, enum: RideStatus, default: RideStatus.Requested })
    status: string

    @Prop({ required: true }) vehicleType: string

    @Prop({ required: true }) pickupLocation: string

    @Prop({ required: true }) dropLocation: string

    @Prop({ required: true }) pickupLat: number; // these four are used to update real time location

    @Prop({ required: true }) pickupLng: number;

    @Prop({ required: true }) dropLat: number;

    @Prop({ required: true }) dropLng: number;

    @Prop({ type: Number, required: true }) estimatedFare: number // before ride starts 

    @Prop({ default: null }) actualFare?: number // after ride ends. Adds the extra minutes and distance to the estimatedFare

    @Prop({ type: Date, default: null }) startTime?: Date

    @Prop({ type: Date, default: null }) endTime?: Date

    @Prop({ type: Number, required: true }) distance: number

    @Prop({ type: Types.ObjectId, ref: 'Rating' })
    rating?: Rating

    @Prop({ default: null, type: Types.ObjectId, ref: 'Earning' })
    earning?: Types.ObjectId

    @Prop({type: Date, default: null})
    scheduleDate?: Date
}

export type RideDocument = Ride & Document
export const RideSchema = SchemaFactory.createForClass(Ride)
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Ride } from "./ride.schema";
import { User } from "./user.schema";

export const EarningStatus = {
    Pending: 'pending',
    Paid: 'paid',
    Failed: 'failed',
    Refunded: 'refunded'
}

export const PaymentMethod = {
    Online: 'online',
    Cash: 'cash'
}

@Schema()
export class Earning {
    @Prop({ type: Types.ObjectId, ref: 'Ride', required: true })
    ride: Ride

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    rider: User

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    driver: User

    @Prop({ type: Number, required: true }) grossAmount: number;         // total charged to rider
    @Prop({ type: Number,required: true }) commission: number;          // platform commission (10% of gross)
    @Prop({ type: Number,required: true }) gstOnCommission: number;     // gst on commission (18% of commission)
    @Prop({ type: Number,required: true }) totalCut: number // commission + gst
    @Prop({ type: Number,required: true }) netAmount: number;           // amount payable to driver (gross - commission)

    @Prop({ enum: EarningStatus, default: EarningStatus.Pending })
    status: string

    @Prop({ enum: ["online", "cash"], required: true })
    paymentMethod: string

    @Prop({ required: true })
    date: Date

    @Prop() settled: boolean

    @Prop() paidToDriver: boolean // online payout done
    @Prop() collectedFromDriver: boolean // cash commission recovered


}

export type EarningDocument = Earning & Document
export const EarningSchema = SchemaFactory.createForClass(Earning)
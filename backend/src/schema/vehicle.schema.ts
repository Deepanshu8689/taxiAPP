import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document, Types } from "mongoose"
import { VehicleType } from "src/enum/vehicleType.enum"
import { User } from "./user.schema"

@Schema()
export class Vehicle {

    @Prop({type: Types.ObjectId, ref: 'User', required: true})
    driver: User

    @Prop({ default: false })
    isVehicleVerified: boolean

    @Prop({ required: true })
    vehicleNumber: string

    @Prop({ required: true, enum: VehicleType })
    vehicleType: string

    @Prop({ required: true })
    vehicleModel: string

    @Prop({ required: true })
    vehicleColor: string

    @Prop({ required: true })
    vehicleName: string

    @Prop({ required: true })
    vehicleImage: string

    @Prop({ required: true })
    vehicleRC: string

    @Prop({ required: true })
    vehicleInsurance: string

}

export type VehicleDocument = Vehicle & Document

export const VehicleSchema = SchemaFactory.createForClass(Vehicle)
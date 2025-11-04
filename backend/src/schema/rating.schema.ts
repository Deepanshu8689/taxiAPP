import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Ride } from "./ride.schema";
import { User } from "./user.schema";

@Schema({ timestamps: true })
export class Rating {
    @Prop({ type: Types.ObjectId, ref: 'Ride' }) ride: Ride;
    @Prop({ type: Types.ObjectId, ref: 'User' }) rider: User;
    @Prop({ type: Types.ObjectId, ref: 'Driver' }) driver: User;
    @Prop({ min: 1, max: 5 }) rating: number;
    @Prop() feedback: string;
}

export type RatingDocument = Rating & Document
export const RatingSchema = SchemaFactory.createForClass(Rating)
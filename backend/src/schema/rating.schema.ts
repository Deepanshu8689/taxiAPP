import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Ride } from "./ride.schema";
import { User } from "./user.schema";

@Schema({ timestamps: true })
export class Rating {
    // Who is giving the rating
    @Prop({ type: Types.ObjectId, ref: 'User', required: true }) 
    ratedBy: User;
    
    // Who is being rated
    @Prop({ type: Types.ObjectId, ref: 'User', required: true }) 
    ratedTo: User;
    
    // The ride this rating is for
    @Prop({ type: Types.ObjectId, ref: 'Ride', required: true }) 
    ride: Ride;
    
    // Type of rating: 'rider-to-driver' or 'driver-to-rider'
    @Prop({ type: String, enum: ['rider-to-driver', 'driver-to-rider'], required: true })
    ratingType: string;
    
    // Overall rating (1-5 stars)
    @Prop({ type: Number, min: 1, max: 5, required: true }) 
    overallRating: number;
    
    // Category-specific ratings (optional but recommended)
    @Prop({ type: Number, min: 1, max: 5 })
    cleanlinessRating?: number;
    
    @Prop({ type: Number, min: 1, max: 5 })
    communicationRating?: number;
    
    @Prop({ type: Number, min: 1, max: 5 })
    punctualityRating?: number;
    
    @Prop({ type: Number, min: 1, max: 5 })
    safetyRating?: number;
    
    // Written review
    @Prop({ type: String, maxlength: 500 })
    review?: string;
    
    // Predefined tags/badges
    @Prop({ type: [String] })
    tags?: string[];
    
    // Whether this rating is anonymous
    @Prop({ type: Boolean, default: false })
    isAnonymous: boolean;
    
    // Admin can hide inappropriate reviews
    @Prop({ type: Boolean, default: false })
    isHidden: boolean;
    
    // Track if user found this review helpful
    @Prop({ type: Number, default: 0 })
    helpfulCount: number;
}

export type RatingDocument = Rating & Document;
export const RatingSchema = SchemaFactory.createForClass(Rating);

// Add indexes for better query performance
RatingSchema.index({ ratedTo: 1, ratingType: 1 });
RatingSchema.index({ ride: 1, ratingType: 1 }, { unique: true }); // Prevent duplicate ratings for same ride
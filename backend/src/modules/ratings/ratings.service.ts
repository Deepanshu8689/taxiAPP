import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RatingAndReviewDto } from 'src/dto/ratingAndReview.dto';
import { Rating, RatingDocument } from 'src/schema/rating.schema';
import { Ride, RideDocument } from 'src/schema/ride.schema';
import { User, UserDocument } from 'src/schema/user.schema';

@Injectable()
export class RatingsService {
    constructor(
        @InjectModel(User.name) private userSchema: Model<UserDocument>,
        @InjectModel(Rating.name) private ratingSchema: Model<RatingDocument>,
        @InjectModel(Ride.name) private rideSchema: Model<RideDocument>,
    ) { }

    async check(user: any, rideId: string, ratingType: string) {
        const userExists = await this.userSchema.findById(user.sub)
        const ride = await this.rideSchema.findById(rideId)
        console.log("ride: ", userExists._id)

        const rating = await this.ratingSchema.findOne({
                ride: ride._id,
                ratingType,
                ratedBy: userExists._id
            })
        console.log("rating: ", rating)
        if (rating) {
            return rating
        } else {
            return null
        }
    }

    async createRating(user: any, dto: RatingAndReviewDto) {

        try {
            const { rideId, ratingType, overallRating, cleanlinessRating, punctualityRating, communicationRating, safetyRating, review, tags, isAnonymous } = dto
            const ride = await this.rideSchema.findById(rideId)
            console.log("ride: ", ride)

            const userExists = await this.userSchema.findById(user.sub)
            const ratedTo = ratingType === 'rider-to-driver'
                ? ride.driver
                : ride.rider

            const rating = await this.ratingSchema.create({
                ratedBy: userExists._id,
                ratedTo,
                ride: ride._id,
                ratingType,
                overallRating,
                cleanlinessRating,
                punctualityRating,
                communicationRating,
                safetyRating,
                review,
                tags,
                isAnonymous
            })

            if (!rating) {
                throw new BadRequestException("Rating not created")
            }

            await ride.updateOne({ $push: { rating: rating._id } })
            await this.userSchema.findOneAndUpdate(
                { _id: ratedTo },
                { $push: { ratings: rating._id } },
                { new: true }
            )
            
            return rating
        } catch (error) {
            console.log("error in createRating: ", error)
            throw error
        }
    }
}

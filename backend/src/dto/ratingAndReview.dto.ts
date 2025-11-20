import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator"

export class RatingAndReviewDto {
    @IsString()
    @IsNotEmpty()
    rideId: string

    @IsString()
    @IsNotEmpty()
    ratingType: string

    @IsNotEmpty()
    overallRating: number

    @IsOptional()
    cleanlinessRating: number

    @IsOptional()
    communicationRating: number

    @IsOptional()
    punctualityRating: number

    @IsOptional()
    safetyRating: number

    @IsString()
    @IsNotEmpty()
    review: string

    @IsOptional()
    tags: string[]

    @IsBoolean()
    isAnonymous: boolean
}
import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { User } from 'src/common/decorators/req-user.decorator';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { RoleGuard } from 'src/common/guards/role/role.guard';
import { RatingAndReviewDto } from 'src/dto/ratingAndReview.dto';

@Controller('ratings')
@UseGuards(AuthGuard, RoleGuard)
export class RatingsController {
    constructor(
        private ratingService: RatingsService
    ) { }

    @Get('/exists/:rideId')
    async check(
        @Param('rideId') rideId: string,
        @Query('type') ratingType: string,
        @User() user: any
    ) {
        const exists = await this.ratingService.check(user, rideId, ratingType)
        return {
            exists
        }
    }

    @Post('/createRating')
    async createRating(
        @User() user: any,
        @Body() dto: RatingAndReviewDto
    ) {
        console.log("dto: ", dto.ratingType)
        return await this.ratingService.createRating(user, dto)
    }
}

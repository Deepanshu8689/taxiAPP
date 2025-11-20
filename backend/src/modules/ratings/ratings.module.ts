import { Module } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { RatingsController } from './ratings.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Rating, RatingSchema } from 'src/schema/rating.schema';
import { Ride, RideSchema } from 'src/schema/ride.schema';
import { User, UserSchema } from 'src/schema/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Rating.name, schema: RatingSchema },
      { name: Ride.name, schema: RideSchema },
      { name: User.name, schema: UserSchema },
    ]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        global: true,
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN')
        }
      })
    }),
  ],
  providers: [RatingsService],
  controllers: [RatingsController]
})
export class RatingsModule { }

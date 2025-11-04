import { Module } from '@nestjs/common';
import { RideService } from './ride.service';
import { RideController } from './ride.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Ride, RideSchema } from 'src/schema/ride.schema';
import { RideRepository } from './ride.respository';
import { CommonService } from '../common/common.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Vehicle, VehicleSchema } from 'src/schema/vehicle.schema';
import { RideGateway } from './ride.gateway';
import { User, UserSchema } from 'src/schema/user.schema';
import { Earning, EarningSchema } from 'src/schema/earning.schema';
import { WalletService } from '../wallet/wallet.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Ride.name, schema: RideSchema },
            { name: User.name, schema: UserSchema },
            { name: Earning.name, schema: EarningSchema },
            { name: Vehicle.name, schema: VehicleSchema },
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
    providers: [RideService, RideRepository, CommonService, RideGateway, WalletService],
    controllers: [RideController]
})
export class RideModule { }

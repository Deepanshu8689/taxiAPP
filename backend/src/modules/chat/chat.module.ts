import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { RideRepository } from '../ride/ride.respository';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SocketService } from '../socket/socket.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Ride, RideSchema } from 'src/schema/ride.schema';
import { User, UserSchema } from 'src/schema/user.schema';
import { Earning, EarningSchema } from 'src/schema/earning.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: Ride.name, schema: RideSchema},
      {name: User.name, schema: UserSchema},
      {name: Earning.name, schema: EarningSchema}
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
  controllers: [ChatController],
  providers: [ChatGateway, RideRepository, SocketService]
})
export class ChatModule { }

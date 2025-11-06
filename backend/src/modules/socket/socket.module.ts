import { Module } from '@nestjs/common';
import { SocketService } from './socket.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SocketConnection, SocketConnectionSchema } from 'src/schema/socketConnection.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: SocketConnection.name, schema: SocketConnectionSchema}
    ])
  ],
  providers: [SocketService],
  exports: [SocketService]
})
export class SocketModule {}

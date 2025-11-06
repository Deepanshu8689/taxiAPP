import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class SocketConnection {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  role: 'driver' | 'rider' | string;

  @Prop({ required: true, unique: true })
  socketId: string;
}

export type SocketConnectionDocument = SocketConnection & Document;
export const SocketConnectionSchema = SchemaFactory.createForClass(SocketConnection);

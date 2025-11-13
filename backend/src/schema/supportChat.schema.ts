import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ timestamps: true })
export class SupportMessage {
  @Prop({ required: true })
  senderId: string;

  @Prop({ required: true })
  senderRole: string; // 'rider', 'driver', 'admin', 'support'

  @Prop({ required: true })
  content: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const SupportMessageSchema = SchemaFactory.createForClass(SupportMessage);


@Schema({ timestamps: true })
export class SupportChat {
  @Prop({ required: true })
  userId: string; // rider/driver initiating the chat

  @Prop({ required: true, unique: true })
  ticketId: string

  @Prop({ required: true })
  userRole: string;

  @Prop({ type: [SupportMessageSchema], default: [] })
  messages: SupportMessage[];

  @Prop({ default: 'open', enum: ['open', 'closed'] }) // 'open', 'closed'
  status: string;
}

export type SupportChatDocument = SupportChat & Document;
export const SupportChatSchema = SchemaFactory.createForClass(SupportChat);
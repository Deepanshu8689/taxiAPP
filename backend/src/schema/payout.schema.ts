import { Prop, Schema } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { User } from "./user.schema";

@Schema()
export class Payout {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  driver: User;

  @Prop() payoutId: string;             // Razorpay payout id
  @Prop() fundAccountId: string;
  @Prop() amount: number;
  @Prop() status: string;               // processing | processed | failed | reversed
  @Prop() idempotencyKey: string;

  @Prop() createdAt: Date;
  @Prop() processedAt?: Date;
  @Prop() failureReason?: string;
}

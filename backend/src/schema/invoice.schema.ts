import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({timestamps: true})
export class Invoice {
    @Prop({ required: true })
    invoiceId: string;

    @Prop()
    currency: string;

    @Prop({type: Number})
    amount: number

    @Prop({ default: 'paid' })
    status: string;

    @Prop()
    hostedInvoiceUrl: string;

    @Prop()
    invoicePdf?: string;
}

export type InvoiceDocument = Invoice & Document
export const InvoiceSchema = SchemaFactory.createForClass(Invoice)
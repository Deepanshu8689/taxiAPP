import { Body, Controller, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { User } from 'src/common/decorators/req-user.decorator';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { RoleGuard } from 'src/common/guards/role/role.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/enum/role.enum';
import { Request, Response } from 'express';
import { validateWebhookSignature } from 'razorpay/dist/utils/razorpay-utils';
import { ConfigService } from '@nestjs/config';

@Controller('payment')
@UseGuards(AuthGuard, RoleGuard)
export class PaymentController {
    constructor(
        private paymentService: PaymentService,
        private configService: ConfigService
    ) {}

    @Post('/create-order')
    @Roles(Role.User)
    async createOrder(
        @User() user: any,
        @Body() body: any
    ){
        return await this.paymentService.createOrder(body.amount, user)
    }

    @Post('/webhook')
    @HttpCode(200)
    async handleWebhook(@Req() req: Request, @Res() res: Response) {
        const webhookSignature = req.headers["x-razorpay-signature"];

        if (!webhookSignature) {
            throw new Error("Webhook signature is not present")
        }
        const signature =
            Array.isArray(webhookSignature) ? webhookSignature[0] : webhookSignature;

        const isWebhookValid = validateWebhookSignature(
            JSON.stringify(req.body),
            signature,
            this.configService.get<string>('RAZORPAY_WEBHOOK_SECRET'),
        )

        if (!isWebhookValid) {
            res.status(400).json({
                success: false,
                message: "Invalid Signature"
            })
        }

        const event = req.body.event;
        const payload = req.body.payload

        console.log("webhook event: ", event)
        console.log("webhook payload: ", payload)

        // if (event === 'payment.captured') {
        //     await this.razorpayService.handlePaymentCaptured(payload.payment.entity);
        // } else if (event === 'payment.failed') {
        //     await this.razorpayService.handlePaymentFailed(payload.payment.entity);
        // }
        return res.status(200).json({ status: 'success' });
    }
}

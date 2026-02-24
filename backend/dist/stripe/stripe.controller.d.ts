import { RawBodyRequest } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
export declare class StripeController {
    private stripeService;
    private configService;
    private stripe;
    constructor(stripeService: StripeService, configService: ConfigService);
    createCheckoutSession(req: any): Promise<{
        sessionId: string;
        url: string;
    }>;
    verifySession(req: any, body: {
        sessionId: string;
    }): Promise<{
        verified: boolean;
        paid: boolean;
        message: string;
        status?: undefined;
        payment_status?: undefined;
        error?: undefined;
    } | {
        verified: boolean;
        paid: boolean;
        status: Stripe.Checkout.Session.Status;
        payment_status: Stripe.Checkout.Session.PaymentStatus;
        message?: undefined;
        error?: undefined;
    } | {
        verified: boolean;
        error: any;
        paid?: undefined;
        message?: undefined;
        status?: undefined;
        payment_status?: undefined;
    }>;
    handleWebhook(req: RawBodyRequest<Request>, signature: string): Promise<{
        received: boolean;
        error?: undefined;
    } | {
        received: boolean;
        error: any;
    }>;
}

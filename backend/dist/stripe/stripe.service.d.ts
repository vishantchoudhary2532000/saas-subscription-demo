import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { UsersService } from '../users/users.service';
export declare class StripeService {
    private configService;
    private usersService;
    private stripe;
    constructor(configService: ConfigService, usersService: UsersService);
    createCheckoutSession(userId: string, userEmail: string): Promise<Stripe.Response<Stripe.Checkout.Session>>;
    verifyCheckoutSession(sessionId: string, userId: string): Promise<{
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
    handleWebhook(event: Stripe.Event): Promise<void>;
}

import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Headers,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Controller('stripe')
export class StripeController {
  private stripe: Stripe;

  constructor(
    private stripeService: StripeService,
    private configService: ConfigService,
  ) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY') || '',
      {
        apiVersion: '2026-01-28.clover',
      },
    );
  }

  @Post('create-checkout-session')
  @UseGuards(JwtAuthGuard)
  async createCheckoutSession(@Request() req) {
    const user = req.user;
    const session = await this.stripeService.createCheckoutSession(
      user.userId,
      user.email,
    );
    return { sessionId: session.id, url: session.url };
  }

  @Post('verify-session')
  @UseGuards(JwtAuthGuard)
  async verifySession(@Request() req, @Body() body: { sessionId: string }) {
    const user = req.user;
    return this.stripeService.verifyCheckoutSession(body.sessionId, user.userId);
  }

  @Post('webhook')
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );

    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      return { received: false };
    }

    if (!signature) {
      console.error('Missing stripe-signature header');
      return { received: false, error: 'Missing signature' };
    }

    let event: Stripe.Event;

    try {
      if (!req.rawBody) {
        console.error('Raw body not available');
        return { received: false, error: 'Raw body not available' };
      }
      event = this.stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        webhookSecret,
      );
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return { received: false, error: err.message };
    }

    await this.stripeService.handleWebhook(event);

    return { received: true };
  }
}

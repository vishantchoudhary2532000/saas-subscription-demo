import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { UsersService } from '../users/users.service';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY') || '',
      {
        apiVersion: '2026-01-28.clover',
      },
    );
  }

  async createCheckoutSession(userId: string, userEmail: string) {
    const priceId = this.configService.get<string>('STRIPE_PRICE_ID');
    if (!priceId) {
      throw new Error('STRIPE_PRICE_ID not configured');
    }

    // Verify the price is a recurring price
    try {
      const price = await this.stripe.prices.retrieve(priceId);
      if (price.type !== 'recurring') {
        throw new Error(
          `Price ${priceId} is not a recurring price. Please use a subscription price.`,
        );
      }
    } catch (error: any) {
      if (error.message.includes('not a recurring price')) {
        throw error;
      }
      throw new Error(`Invalid price ID: ${priceId}. ${error.message}`);
    }

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000'}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000'}/pricing`,
      customer_email: userEmail,
      metadata: {
        userId: userId,
      },
    });

    return session;
  }

  async verifyCheckoutSession(sessionId: string, userId: string) {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);

      // Verify the session belongs to this user
      if (session.metadata?.userId !== userId) {
        return { verified: false, error: 'Session does not belong to user' };
      }

      // If payment is complete, mark user as paid
      if (session.payment_status === 'paid' && session.status === 'complete') {
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        const user = await this.usersService.findById(userId);
        if (user && !user.isPaid) {
          await this.usersService.markAsPaid(userId, customerId, subscriptionId);
          console.log(`User ${userId} marked as paid via session verification`);
        }

        return {
          verified: true,
          paid: true,
          message: 'Payment verified and subscription activated',
        };
      }

      return {
        verified: true,
        paid: false,
        status: session.status,
        payment_status: session.payment_status,
      };
    } catch (error: any) {
      console.error('Session verification error:', error.message);
      return { verified: false, error: error.message };
    }
  }

  async handleWebhook(event: Stripe.Event) {
    console.log('Webhook received:', event.type);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      console.log('Checkout session completed:', {
        sessionId: session.id,
        userId,
        customerId,
        subscriptionId,
        paymentStatus: session.payment_status,
      });

      if (userId) {
        try {
          await this.usersService.markAsPaid(userId, customerId, subscriptionId);
          console.log(`✓ User ${userId} marked as paid via webhook`);
        } catch (error: any) {
          console.error(`✗ Failed to mark user ${userId} as paid:`, error.message);
        }
      } else {
        console.warn('No userId in session metadata');
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      console.log('Subscription cancelled:', subscription.id);
      // Handle subscription cancellation if needed
    }
  }
}

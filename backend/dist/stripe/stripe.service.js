"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const stripe_1 = __importDefault(require("stripe"));
const users_service_1 = require("../users/users.service");
let StripeService = class StripeService {
    constructor(configService, usersService) {
        this.configService = configService;
        this.usersService = usersService;
        this.stripe = new stripe_1.default(this.configService.get('STRIPE_SECRET_KEY') || '', {
            apiVersion: '2026-01-28.clover',
        });
    }
    async createCheckoutSession(userId, userEmail) {
        const priceId = this.configService.get('STRIPE_PRICE_ID');
        if (!priceId) {
            throw new Error('STRIPE_PRICE_ID not configured');
        }
        try {
            const price = await this.stripe.prices.retrieve(priceId);
            if (price.type !== 'recurring') {
                throw new Error(`Price ${priceId} is not a recurring price. Please use a subscription price.`);
            }
        }
        catch (error) {
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
            success_url: `${this.configService.get('FRONTEND_URL') || 'http://localhost:3000'}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${this.configService.get('FRONTEND_URL') || 'http://localhost:3000'}/pricing`,
            customer_email: userEmail,
            metadata: {
                userId: userId,
            },
        });
        return session;
    }
    async verifyCheckoutSession(sessionId, userId) {
        try {
            const session = await this.stripe.checkout.sessions.retrieve(sessionId);
            if (session.metadata?.userId !== userId) {
                return { verified: false, error: 'Session does not belong to user' };
            }
            if (session.payment_status === 'paid' && session.status === 'complete') {
                const customerId = session.customer;
                const subscriptionId = session.subscription;
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
        }
        catch (error) {
            console.error('Session verification error:', error.message);
            return { verified: false, error: error.message };
        }
    }
    async handleWebhook(event) {
        console.log('Webhook received:', event.type);
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const userId = session.metadata?.userId;
            const customerId = session.customer;
            const subscriptionId = session.subscription;
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
                }
                catch (error) {
                    console.error(`✗ Failed to mark user ${userId} as paid:`, error.message);
                }
            }
            else {
                console.warn('No userId in session metadata');
            }
        }
        if (event.type === 'customer.subscription.deleted') {
            const subscription = event.data.object;
            console.log('Subscription cancelled:', subscription.id);
        }
    }
};
exports.StripeService = StripeService;
exports.StripeService = StripeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        users_service_1.UsersService])
], StripeService);
//# sourceMappingURL=stripe.service.js.map
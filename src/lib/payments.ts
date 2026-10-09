// Payment Service — Adapter pattern for multiple providers
// Supports: Stripe, Paynow (Zimbabwe), EcoCash, Bank Transfer
// Configure via environment variables

import prisma from './db';

export interface PaymentProvider {
  name: string;
  createPayment(amount: number, currency: string, description: string, metadata?: Record<string, string>): Promise<PaymentResult>;
  verifyPayment(reference: string): Promise<PaymentVerification>;
}

export interface PaymentResult {
  success: boolean;
  reference: string;
  redirectUrl?: string;
  providerData?: Record<string, unknown>;
  error?: string;
}

export interface PaymentVerification {
  success: boolean;
  status: 'PENDING' | 'SUCCESSFUL' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
  amount?: number;
  currency?: string;
  error?: string;
}

export type PaymentPurpose = 'SUBSCRIPTION' | 'PROMOTION' | 'ADVERTISING' | 'LISTING_FEE';

// Stripe Provider
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;

class StripeProvider implements PaymentProvider {
  name = 'Stripe';

  async createPayment(amount: number, currency: string, description: string): Promise<PaymentResult> {
    if (!STRIPE_KEY) return { success: false, reference: '', error: 'Stripe not configured' };

    const res = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: Math.round(amount * 100).toString(),
        currency: currency.toLowerCase(),
        description,
        'automatic_payment_methods[enabled]': 'true',
      }),
    });

    if (!res.ok) return { success: false, reference: '', error: 'Stripe payment creation failed' };
    const data = await res.json();
    return { success: true, reference: data.id, providerData: data };
  }

  async verifyPayment(reference: string): Promise<PaymentVerification> {
    if (!STRIPE_KEY) return { success: false, status: 'FAILED', error: 'Stripe not configured' };

    const res = await fetch(`https://api.stripe.com/v1/payment_intents/${reference}`, {
      headers: { 'Authorization': `Bearer ${STRIPE_KEY}` },
    });

    if (!res.ok) return { success: false, status: 'FAILED' };
    const data = await res.json();

    const statusMap: Record<string, PaymentVerification['status']> = {
      succeeded: 'SUCCESSFUL',
      processing: 'PENDING',
      requires_payment_method: 'PENDING',
      canceled: 'CANCELLED',
    };

    return {
      success: data.status === 'succeeded',
      status: statusMap[data.status] || 'PENDING',
      amount: data.amount / 100,
      currency: data.currency?.toUpperCase(),
    };
  }
}

// Paynow Provider (Zimbabwe)
const PAYNOW_ID = process.env.PAYNOW_INTEGRATION_ID;
const PAYNOW_KEY = process.env.PAYNOW_INTEGRATION_KEY;

class PaynowProvider implements PaymentProvider {
  name = 'Paynow';

  async createPayment(amount: number, currency: string, description: string, metadata?: Record<string, string>): Promise<PaymentResult> {
    if (!PAYNOW_ID || !PAYNOW_KEY) return { success: false, reference: '', error: 'Paynow not configured' };

    const res = await fetch('https://www.paynow.co.zw/interface/initiatetransaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: PAYNOW_ID,
        key: PAYNOW_KEY,
        amount,
        currency,
        reference: metadata?.reference || `ZM-${Date.now()}`,
        resulturl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook/paynow`,
        returnurl: `${process.env.NEXT_PUBLIC_APP_URL}/payments/success`,
        authemail: metadata?.email || '',
      }),
    });

    if (!res.ok) return { success: false, reference: '', error: 'Paynow payment creation failed' };
    const data = await res.json();

    return {
      success: data.status === 'Ok',
      reference: data.pollurl || '',
      redirectUrl: data.redirecturl,
      providerData: data,
    };
  }

  async verifyPayment(reference: string): Promise<PaymentVerification> {
    const res = await fetch(reference);
    const text = await res.text();
    const params = new URLSearchParams(text);

    const status = params.get('status');
    return {
      success: status === 'Paid',
      status: status === 'Paid' ? 'SUCCESSFUL' : status === 'Cancelled' ? 'CANCELLED' : 'PENDING',
    };
  }
}

// Bank Transfer Provider (Manual)
class BankTransferProvider implements PaymentProvider {
  name = 'Bank Transfer';

  async createPayment(amount: number, currency: string, description: string, metadata?: Record<string, string>): Promise<PaymentResult> {
    const ref = `BT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    return {
      success: true,
      reference: ref,
      providerData: {
        bankName: process.env.BANK_NAME || 'CBZ Bank',
        accountName: process.env.BANK_ACCOUNT_NAME || 'ZimMarket (Pvt) Ltd',
        accountNumber: process.env.BANK_ACCOUNT_NUMBER || '***-***-****',
        branchCode: process.env.BANK_BRANCH_CODE || '',
        amount,
        currency,
        reference: ref,
        instructions: `Transfer ${currency} ${amount} to the account above. Use reference: ${ref}. Payment will be confirmed within 24 hours.`,
      },
    };
  }

  async verifyPayment(): Promise<PaymentVerification> {
    // Bank transfers are manually verified by admin
    return { success: false, status: 'PENDING' };
  }
}

// Provider Registry
const providers: Record<string, PaymentProvider> = {
  stripe: new StripeProvider(),
  paynow: new PaynowProvider(),
  bank: new BankTransferProvider(),
};

export function getAvailableProviders(): { name: string; configured: boolean }[] {
  return [
    { name: 'Stripe (Card)', configured: !!STRIPE_KEY },
    { name: 'Paynow (EcoCash/Card)', configured: !!(PAYNOW_ID && PAYNOW_KEY) },
    { name: 'Bank Transfer', configured: true },
  ];
}

export function getProvider(name: string): PaymentProvider | null {
  return providers[name] || null;
}

export async function createPayment(
  userId: string,
  amount: number,
  currency: string,
  purpose: PaymentPurpose,
  providerName: string,
  description: string,
  metadata?: Record<string, string>
) {
  const provider = getProvider(providerName);
  if (!provider) throw new Error(`Unknown payment provider: ${providerName}`);

  const result = await provider.createPayment(amount, currency, description, metadata);

  // Record payment in database
  const payment = await prisma.payment.create({
    data: {
      userId,
      amount,
      currency,
      purpose,
      provider: providerName,
      providerTxId: result.reference,
      status: result.success ? 'PENDING' : 'FAILED',
      reference: result.reference,
      metadata: JSON.stringify(result.providerData || {}),
    },
  });

  return { payment, result };
}

export async function verifyAndUpdatePayment(paymentId: string) {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment || !payment.provider) return null;

  const provider = getProvider(payment.provider);
  if (!provider) return null;

  const verification = await provider.verifyPayment(payment.providerTxId || '');

  if (verification.status !== 'PENDING') {
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: verification.status },
    });
  }

  return verification;
}
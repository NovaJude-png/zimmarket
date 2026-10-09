import { NextResponse } from 'next/server';
import { isCloudinaryConfigured } from '@/lib/upload';
import { isEmailConfigured } from '@/lib/email';
import { getAvailableProviders } from '@/lib/payments';

// Public endpoint — shows integration status without exposing secrets
export async function GET() {
  return NextResponse.json({
    platform: 'ZimMarket',
    version: '0.1.0',
    builtBy: 'Nova Tech',
    integrations: {
      imageUpload: {
        provider: isCloudinaryConfigured() ? 'Cloudinary' : 'Local filesystem',
        configured: true,
      },
      email: {
        configured: isEmailConfigured(),
      },
      payments: getAvailableProviders().map(p => ({
        name: p.name,
        configured: p.configured,
      })),
      sms: {
        configured: !!(process.env.TWILIO_ACCOUNT_SID || process.env.AFRICASTALKING_API_KEY),
      },
      ai: {
        configured: !!process.env.OPENAI_API_KEY,
      },
    },
  });
}
import { NextRequest, NextResponse } from 'next/server';

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const LIMITS: Record<string, { max: number; window: number }> = {
  '/api/auth/login': { max: 5, window: 60000 },
  '/api/auth/register': { max: 3, window: 60000 },
  '/api/auth/forgot-password': { max: 3, window: 300000 },
  '/api/listings': { max: 20, window: 60000 },
  '/api/messages': { max: 30, window: 60000 },
  '/api/upload': { max: 10, window: 60000 },
  '/api/ads': { max: 5, window: 60000 },
  '/api/orders': { max: 10, window: 60000 },
};

function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
}

function checkRateLimit(key: string, max: number, window: number): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + window });
    return { allowed: true, remaining: max - 1 };
  }

  if (entry.count >= max) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: max - entry.count };
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (request.method === 'OPTIONS') return NextResponse.next();

  for (const [route, limit] of Object.entries(LIMITS)) {
    if (pathname.startsWith(route) && request.method !== 'GET') {
      const ip = getClientIP(request);
      const key = `${ip}:${route}`;
      const { allowed, remaining } = checkRateLimit(key, limit.max, limit.window);

      if (!allowed) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          {
            status: 429,
            headers: {
              'Retry-After': String(Math.ceil(limit.window / 1000)),
              'X-RateLimit-Limit': String(limit.max),
              'X-RateLimit-Remaining': '0',
            },
          }
        );
      }

      const response = NextResponse.next();
      response.headers.set('X-RateLimit-Limit', String(limit.max));
      response.headers.set('X-RateLimit-Remaining', String(remaining));
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
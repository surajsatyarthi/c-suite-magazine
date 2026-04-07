import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_COOKIE = 'admin_session';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // --- Admin route protection ---
  // All /admin/* routes require authentication, except /admin/login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const session = req.cookies.get(ADMIN_COOKIE)?.value;
    const secret = process.env.ADMIN_SECRET;

    if (!secret || !session || session !== secret) {
      const loginUrl = new URL('/admin/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // --- Bot blocking (saves compute on free tier) ---
  const userAgent = req.headers.get('user-agent')?.toLowerCase() || '';
  const forbiddenBots = [
    'gptbot',
    'bytespider',
    'claudebot',
    'anthropic-ai',
    'omgili',
    'omgilibot',
    'facebookexternalhit',
    'mj12bot',
    'semrushbot',
    'dotbot',
  ];

  if (forbiddenBots.some((bot) => userAgent.includes(bot))) {
    return new NextResponse('Access Denied: Bot Traffic Blocked to Save Resources', { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Only run on page routes — exclude API, Next.js internals, static files, and public assets
    '/((?!api|_next/static|_next/image|_next/data|favicon\\.ico|sitemap\\.xml|robots\\.txt|images|fonts|icons|.*\\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico|woff2?|ttf|otf|mp4|pdf|json)).*)',
  ],
};

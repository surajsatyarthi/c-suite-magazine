import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const userAgent = req.headers.get('user-agent')?.toLowerCase() || '';
  
  // List of bots to block to save compute
  // These bots are known to be aggressive and provide little value to a content site
  const forbiddenBots = [
    'gptbot', 
    'bytespider', 
    'claudebot', 
    'anthropic-ai', 
    'omgili', 
    'omgilibot',
    'facebookexternalhit', // Optional: Blocks FB previews/scraping if high load
    'mj12bot',
    'semrushbot',
    'dotbot'
  ];

  if (forbiddenBots.some(bot => userAgent.includes(bot))) {
    return new NextResponse('Access Denied: Bot Traffic Blocked to Save Resources', { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  // Ensure the middleware only runs on actual page routes, not static assets or API calls
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - images/ (public images folder)
     * - fonts/ (public fonts folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|images|fonts).*)',
  ],
};

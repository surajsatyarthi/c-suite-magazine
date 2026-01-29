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
  matcher: '/:path*',
};

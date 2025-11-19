import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Try to get country from various headers (Vercel, Cloudflare, etc.)
    const countryFromHeader = 
      request.headers.get('x-vercel-ip-country') ||
      request.headers.get('cf-ipcountry') ||
      request.headers.get('x-country-code') ||
      null;

    // Get country from cookie if it exists (user override)
    const countryFromCookie = request.cookies.get('user-country')?.value;

    // Priority: Cookie (user choice) > Header (auto-detected) > Default (US)
    const country = countryFromCookie || countryFromHeader || 'US';

    return NextResponse.json({ 
      country: country.toUpperCase(),
      source: countryFromCookie ? 'manual' : countryFromHeader ? 'auto' : 'default'
    });
  } catch (error) {
    console.error('Country detection error:', error);
    return NextResponse.json({ 
      country: 'US', 
      source: 'default' 
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { country } = await request.json();
    
    if (!country || typeof country !== 'string' || country.length !== 2) {
      return NextResponse.json({ error: 'Invalid country code' }, { status: 400 });
    }

    // Set cookie for user's manual country selection
    const response = NextResponse.json({ 
      success: true, 
      country: country.toUpperCase() 
    });
    
    response.cookies.set('user-country', country.toUpperCase(), {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      httpOnly: false, // Allow client-side access
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    return response;
  } catch (error) {
    console.error('Country update error:', error);
    return NextResponse.json({ error: 'Failed to update country' }, { status: 500 });
  }
}
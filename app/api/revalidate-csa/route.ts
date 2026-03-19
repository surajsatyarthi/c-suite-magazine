import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

/**
 * On-demand revalidation for CSA articles.
 * Usage: /api/revalidate-csa?secret=YOUR_SECRET&path=/csa/your-slug
 * 
 * This allows instant updates from Sanity without wait times or full rebuilds.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const path = searchParams.get('path');

  // Use the Sanity API token as the secret for convenience and security
  const token = process.env.SANITY_API_TOKEN;

  if (secret !== token) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
  }

  if (!path) {
    return NextResponse.json({ message: 'Path parameter is required' }, { status: 400 });
  }

  try {
    // This purges the Next.js cache for the specific page
    revalidatePath(path);
    
    return NextResponse.json({ 
      revalidated: true, 
      path, 
      now: new Date().toISOString(),
      message: `Cache successfully purged for ${path}`
    });
  } catch (err) {
    console.error('[Revalidate-CSA] Error:', err);
    return NextResponse.json({ message: 'Internal Server Error during revalidation' }, { status: 500 });
  }
}

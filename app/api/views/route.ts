import { NextRequest, NextResponse } from 'next/server'
import { writeClient } from '@/lib/sanityWrite'
import { validateWriteRequest } from '@/lib/security'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting for view updates (more lenient than write operations)
    const { error } = await validateWriteRequest(request, {
      requireReferer: false, // Allow direct requests for view counting
      validateContent: false,
      allowedContentTypes: ['application/json']
    })
    
    if (error) return error
    
    const body = await request.json()
    const { slug } = body || {}
    if (!slug) {
      return NextResponse.json({ ok: false, error: 'Missing slug' }, { status: 400 })
    }

    // Find post by slug
    const query = `*[_type == "post" && slug.current == $slug][0]{ _id, views }`
    const post = await writeClient.fetch(query, { slug })
    if (!post?._id) {
      return NextResponse.json({ ok: false, error: 'Post not found' }, { status: 404 })
    }

    const newViews = (post.views || 0) + 1
    const result = await writeClient.patch(post._id).set({ views: newViews }).commit()

    return NextResponse.json({ ok: true, views: newViews, updated: result })
  } catch (e) {
    console.error('[api/views] Failed to update views:', e)
    return NextResponse.json({ ok: false, error: 'Failed to update views' }, { status: 500 })
  }
}


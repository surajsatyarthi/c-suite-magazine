import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { validatePreviewUrl } from '@sanity/preview-url-secret'
import { client } from '@/lib/sanity'
import { token } from '@/sanity/env'

const clientWithToken = client.withConfig({ 
    token: process.env.SANITY_API_READ_TOKEN || token 
})

export async function GET(request: Request) {
    const { isValid, redirectTo = '/' } = await validatePreviewUrl(
        clientWithToken,
        request.url
    )

    if (!isValid) {
        return new Response('Invalid secret', { status: 401 })
    }

    const draft = await draftMode()
    draft.enable()

    redirect(redirectTo)
}

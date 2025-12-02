import { useToast } from '@sanity/ui'
import { DocumentActionComponent, useClient } from 'sanity'
import { apiVersion } from './env'
import { LinkIcon } from '@sanity/icons'

export const CopyLinkAction: DocumentActionComponent = (props) => {
    const { id, type, draft, published } = props
    const toast = useToast()
    const client = useClient({ apiVersion })

    return {
        label: 'Copy Link',
        icon: LinkIcon,
        onHandle: async () => {
            const doc = published || draft
            if (!doc) return

            let url = ''
            try {
                if (type === 'post') {
                    const slug = (doc.slug as any)?.current
                    if (!slug) {
                        toast.push({ status: 'warning', title: 'Missing slug' })
                        return
                    }
                    // Fetch category to build correct URL
                    const query = `*[_id == $id][0]{ "category": categories[0]->slug.current }`
                    const res = await client.fetch(query, { id: doc._id })
                    const cat = res?.category || 'general'
                    url = `https://csuitemagazine.global/category/${cat}/${slug}`
                } else if (type === 'csa') {
                    const slug = (doc.slug as any)?.current
                    if (!slug) {
                        toast.push({ status: 'warning', title: 'Missing slug' })
                        return
                    }
                    url = `https://csuitemagazine.global/category/company-sponsored/${slug}`
                } else {
                    return
                }

                if (url) {
                    await navigator.clipboard.writeText(url)
                    toast.push({
                        status: 'success',
                        title: 'Link copied to clipboard!',
                        description: url
                    })
                }
            } catch (err) {
                console.error(err)
                toast.push({ status: 'error', title: 'Failed to copy link' })
            }
        }
    }
}

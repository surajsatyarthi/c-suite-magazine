// Redirect to new /csa/ route (company-sponsored URLs are deprecated)
import { redirect } from 'next/navigation'

export default function CompanySponsoredRedirect({ params }: { params: { slug: string } }) {
  redirect(`/csa/${params.slug}`)
}

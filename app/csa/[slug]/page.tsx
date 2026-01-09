// Import the existing CSA article page component
import CompanySponsoredArticlePage from '../../category/company-sponsored/[slug]/page'

// Re-export metadata generation
export { generateMetadata } from '../../category/company-sponsored/[slug]/page'

// Define revalidate statically (Next.js doesn't allow re-exporting route config)
export const revalidate = 600

// Re-use the same page component for the new /csa/ route
export default CompanySponsoredArticlePage

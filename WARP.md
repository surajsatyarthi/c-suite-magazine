# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands

### Development
```bash
npm run dev        # Start Next.js dev server (http://localhost:3000)
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
```

### Sanity CMS
```bash
# Studio is embedded at http://localhost:3000/studio
npx sanity deploy  # Deploy Studio to Sanity hosting
npx sanity manage  # Open project in Sanity Management UI
```

## Architecture

### Tech Stack
- **Framework**: Next.js 14 (App Router) with TypeScript
- **CMS**: Sanity.io (embedded Studio at `/studio` route)
- **Styling**: Tailwind CSS v4
- **Fonts**: Playfair Display (serif headlines), Inter (body text)
- **Hosting**: Vercel-ready

### Content Model (Sanity Schemas)
The CMS has five main content types defined in `sanity/schemaTypes/`:

1. **Post** (`postType.ts`) - Magazine articles
   - Title, slug, excerpt
   - Author reference, categories array
   - Featured image with alt text & caption
   - `isFeatured` boolean for homepage display
   - Rich text body (`blockContent`)
   - SEO fields (metaTitle, metaDescription)

2. **Author** (`authorType.ts`) - Writer profiles
   - Name, slug, position
   - Profile image
   - Bio (rich text)
   - Social links (Twitter, LinkedIn, website)

3. **Category** (`categoryType.ts`) - Article categories
   - Title, slug, description
   - Custom color for badges

4. **BlockContent** (`blockContentType.ts`) - Rich text configuration for article bodies

5. **Advertisement** (`advertisementType.ts`) - Ad management
   - Name, image (with alt text)
   - Target URL, placement (sidebar/article-bottom/banner/etc.)
   - Dimensions (width × height)
   - Active status toggle, start/end dates
   - Priority (higher = shown first)
   - Open in new tab option
   - Internal notes

### Sanity Client Configuration
Two Sanity clients exist in the codebase:
- `sanity/lib/client.ts` - Main client with `useCdn: true` for production
- `lib/sanity.ts` - Alternative client with `useCdn: false` and image URL builder

Use `lib/sanity.ts` for image handling (`urlFor()` function) and data fetching on pages.

### Data Fetching Pattern
Pages use async Server Components with direct Sanity queries via GROQ:

```typescript
// Example from app/page.tsx
const query = `*[_type == "post"] | order(publishedAt desc) [0...6] {
  _id,
  title,
  slug,
  "author": author->{name, slug, position, image},
  "categories": categories[]->{title, slug, color},
  mainImage,
  publishedAt
}`
const posts = await client.fetch(query)
```

**Important**: Always use the `->` operator to dereference author and `[]->` for category arrays in GROQ queries.

### Design System
Located in `DESIGN_REFERENCE.md`. Key colors:
- Primary Dark Blue: `#082945` (headers, dark sections)
- Gold/Yellow: `#c8ab3d` (accents, CTAs)
- White: `#ffffff` (backgrounds, text)

Typography scale uses CSS variables:
- `--font-playfair` for headlines (serif)
- `--font-inter` for body text (sans-serif)

### Environment Variables
Required in `.env.local`:
```
NEXT_PUBLIC_SANITY_PROJECT_ID=<your-project-id>
NEXT_PUBLIC_SANITY_DATASET=<your-dataset>
NEXT_PUBLIC_SANITY_API_VERSION=2025-10-28
```

These are consumed by `sanity/env.ts` which validates their presence at runtime.

## Quality Assurance
**CRITICAL**: Before reporting any task as complete:
1. Verify ALL changes were applied correctly by reading back the modified files
2. Check that removed elements are actually removed (not just claimed to be removed)
3. Validate visual changes meet the exact specifications requested
4. Never report completion without double-checking the actual output
5. If a change is requested, ensure EVERY instance is updated

### Verification Protocol (MANDATORY)
**After EVERY file edit, you MUST:**
1. **Read the file back** - Use `read_any_files` to confirm changes actually applied
2. **For UI changes** - Use `curl` to check live output or ask user to verify visually
3. **Never claim "done" without proof** - Show the actual file content or live page output
4. **If edit tool reports success but verification fails** - Read the current file state before retrying
5. **Trust verification, not tool output** - The edit tool can report success even when changes partially fail

**Example verification workflow:**
```bash
# After editing Footer.tsx:
1. edit_files() → reports success
2. read_any_files(['Footer.tsx']) → verify actual content
3. curl http://localhost:3000 → check live rendering
4. Only then report completion to user
```

## Development Guidelines

### Adding New Content Types
1. Create schema in `sanity/schemaTypes/` (e.g., `tagType.ts`)
2. Export from `sanity/schemaTypes/index.ts`
3. Add corresponding TypeScript interface in `lib/types.ts`
4. Update GROQ queries in relevant pages

### Working with Images
Always use Sanity's image URL builder:
```typescript
import { urlFor } from '@/lib/sanity'
urlFor(image).width(600).height(400).url()
```

Images should include alt text (required in schema validation).

### Ad Management
Ads are managed through Sanity CMS and displayed via the `Ad` component:

```typescript
import Ad from '@/components/Ad'

// Display ad by placement:
<Ad placement="sidebar" />
<Ad placement="article-bottom" className="my-8" />
<Ad placement="homepage-banner" />
```

**How it works:**
- Fetches active ads from Sanity filtered by placement, date range, and `isActive` status
- Displays highest-priority ad for each placement
- Shows placeholder with icon if no ad is configured
- Respects `openInNewTab` setting with proper security (`rel="noopener noreferrer"`)
- Ad component is an async Server Component (data fetched at render time)

**Common placements:**
- `sidebar` - Right sidebar on article pages
- `article-bottom` - Below article content
- `homepage-banner` - Top banner on homepage
- `category-top` - Top of category pages

**To add new ads:**
1. Go to `/studio` → Advertisements
2. Create new ad with image, target URL, and placement
3. Set dimensions, priority, and date range
4. Toggle "Active" to enable

### Creating New Pages
- Use App Router structure: create `app/[route]/page.tsx`
- Server Components by default (async functions allowed)
- Import shared components from `components/`
- Include `<Navigation />` and `<Footer />` for layout consistency

### Styling Conventions
- Use Tailwind utility classes
- Reference design system colors via hex values (e.g., `bg-[#082945]`)
- Font classes: `font-serif` (Playfair) and `font-sans` (Inter)
- Category badges use inline styles with dynamic colors from Sanity

### CSS Specificity & Global Styles (CRITICAL)
**ALWAYS check `app/globals.css` before claiming styling is complete:**

1. **Global element selectors override Tailwind utilities**
   - `app/globals.css` contains base styles for `h1`, `h2`, `h3`, `h4`, `p` elements
   - These set specific colors: `color: var(--text-primary)` for headings, `color: var(--text-secondary)` for paragraphs
   - These OVERRIDE Tailwind classes like `text-white` due to CSS specificity

2. **The `.dark-section` utility class**
   - Use `.dark-section` wrapper class on any section with dark background (`bg-[#082945]`, etc.)
   - This class sets `color: inherit` for h1, h2, h3, h4, p elements inside it
   - This allows Tailwind utilities like `text-white` to work properly
   - Example: `<section className="dark-section bg-[#082945] text-white">`

3. **Debugging color issues - MANDATORY checklist:**
   - [ ] Changed Tailwind class (e.g., `text-gray-300` → `text-white`)
   - [ ] Checked `globals.css` for element-level color rules that might override
   - [ ] Added `.dark-section` class to parent wrapper if on dark background
   - [ ] Read the file back to verify changes
   - [ ] NEVER claim completion without checking all 4 steps above

4. **Why this matters:**
   - CSS specificity: `p { color: gray }` (in globals.css) beats `.text-white` (Tailwind)
   - Solution: `.dark-section p { color: inherit }` allows parent's `text-white` to work
   - Lesson: Always investigate WHY a style isn't applying, don't assume or make excuses

### Display Conventions (CRITICAL)

1. **View Counts Format**
   - ALL view counts must be displayed in MILLIONS (1M+), never in thousands
   - Format: `(views / 1000000).toFixed(1)}M` NOT `(views / 1000).toFixed(1)}K`
   - Dummy data should have views between 1,300,000 - 2,800,000
   - Magazine covers: 1,300,000 - 2,500,000 views
   - Homepage articles: 1,300,000 - 2,800,000 views

2. **Time-Based Metrics**
   - NEVER display "readTime" or "min read" indicators
   - Only display view counts with eye icon
   - Remove any "X min read" text from article cards

3. **Magazine Gallery**
   - Title: "Featured Issues" (NOT "Magazine Archive")
   - NO month/date badges (January 2025, etc.) on magazine covers
   - View count badge at top-right corner with gold background `bg-[#c8ab3d]`
   - Title and "View Issue →" text only visible on hover
   - Strong dark overlay `bg-black/80` on hover for text readability
   - Text must use inline styles `style={{ color: '#ffffff' }}` to override global CSS

4. **Text Color on Dark Backgrounds**
   - Use inline styles `style={{ color: '#ffffff' }}` when global CSS overrides Tailwind
   - Add `.dark-section` class to wrapper elements
   - Never assume `text-white` class works - verify or use inline styles
   - ParallaxHero requires inline color styles for h1 and p elements

5. **Header Tagline**
   - "Your legacy goes global" in Navigation.tsx should NOT be italic
   - Remove `italic` class from this text

### Content Management Workflow
1. Navigate to `/studio` in browser
2. Authenticate with GitHub OAuth (Sanity)
3. Create Authors first (required references)
4. Create Categories for article organization
5. Create Articles/Posts with required fields
6. Use "Featured Article" toggle for homepage display

## Recent Changes (Session Log)
**Date: 2025-10-29**

1. ✅ Fixed white text display on dark backgrounds across entire site
   - Added `.dark-section p { color: inherit }` to globals.css
   - Applied to: ParallaxHero, Footer, all page headers, CEOSpotlight

2. ✅ Removed all "readTime" / "min read" displays, replaced with view counters
   - Updated: Homepage (featured & latest), category pages, author pages, article pages

3. ✅ Changed all view counts from thousands (K) to millions (M)
   - Magazine covers: 1.3M - 2.5M views
   - Article cards: 1.3M - 2.8M views
   - Format: `(views / 1000000).toFixed(1)}M`

4. ✅ Magazine Gallery improvements
   - Removed month badges (January 2025, etc.)
   - Added view count badges at top-right
   - Changed title from "Magazine Archive" to "Featured Issues"
   - Fixed hover text readability with inline color styles

5. ✅ Fixed ParallaxHero subtitle display
   - Changed from `font-bold` to `font-semibold`
   - Added proper text shadow
   - Used inline styles for color to override global CSS

6. ✅ Removed italic from header tagline "Your legacy goes global"

7. ✅ Added advertisement system
   - Created `advertisementType.ts` schema with placement, priority, date scheduling
   - Built `Ad` component (`components/Ad.tsx`) for CMS-managed ad display
   - Supports multiple placements (sidebar, article-bottom, homepage-banner, etc.)
   - Auto-filters by active status and date range
   - Displays placeholder when no ad is configured
   - Respects custom dimensions and "open in new tab" settings

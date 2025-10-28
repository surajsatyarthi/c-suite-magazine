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
The CMS has four main content types defined in `sanity/schemaTypes/`:

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

### Content Management Workflow
1. Navigate to `/studio` in browser
2. Authenticate with GitHub OAuth (Sanity)
3. Create Authors first (required references)
4. Create Categories for article organization
5. Create Articles/Posts with required fields
6. Use "Featured Article" toggle for homepage display

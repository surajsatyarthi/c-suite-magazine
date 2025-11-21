# The CEO Magazine

A premium, high-end magazine blog targeting global CXOs built with Next.js 14, Sanity CMS, and Tailwind CSS.

## Features

- ✨ Elegant, classic design inspired by The CEO Magazine
- 🚀 Lightning-fast performance with Next.js 14 App Router
- 📝 Powerful content management with Sanity CMS
- 🎨 Beautiful typography with Playfair Display & Inter fonts
- 📱 Fully responsive and mobile-friendly
- 🎯 SEO optimized
- 🌐 Ready for deployment on Vercel

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **CMS**: Sanity.io
- **Fonts**: Playfair Display (serif), Inter (sans-serif)
- **Hosting**: Vercel (recommended)

## Design System

### Color Palette
- Primary Dark Blue: `#082945`
- Gold/Yellow: `#c8ab3d`
- White: `#ffffff`

See `DESIGN_REFERENCE.md` for complete design system documentation.

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git

### Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Environment Variables**:
The `.env.local` file should already exist with your Sanity configuration.

3. **Run the development server**:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your magazine.

4. **Access Sanity Studio** (Content Management):
```bash
# Studio is embedded in the Next.js app
# Navigate to: http://localhost:3000/studio
```

## Content Management

### Adding Content via Sanity Studio

1. Navigate to `http://localhost:3000/studio`
2. Log in with your Sanity account (GitHub OAuth)
3. Start creating:
   - **Writers**: Add writer profiles with photos and bios
   - **Categories**: Create content categories (Leadership, Innovation, etc.)
   - **Articles**: Write and publish your magazine articles

### Content Types

#### Articles (Posts)
- Title, slug, excerpt
- Featured image with alt text
- Writer reference (required)
- Categories
- Rich text content
- Featured flag for homepage
- Read time
- SEO fields

#### Writers
- Name, slug, position
- Profile photo
- Biography
- Social media links

#### Categories
- Title, slug, description
- Custom accent color for badges

## Deployment

### Deploy to Vercel (Recommended)

1. **Push your code to GitHub**:
```bash
git add .
git commit -m "Initial commit"
git push -u origin main
```

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Vercel will auto-detect Next.js
   - Add environment variables from `.env.local`
   - Click "Deploy"

3. **Add your domain** (when ready):
   - Go to Project Settings > Domains
   - Add your custom domain
   - Update DNS records as instructed

## Project Status & Recent Changes

- Site is live on `csuitemagazine.global`.
- Footer displays version from `package.json`; current version: `3.3.3.3` (rendered in `ceo-magazine/components/Footer.tsx:46`).
- Ads are CMS‑controlled; sidebar uses fallback Brabus vertical ad only when CMS content is missing or invalid (`ceo-magazine/components/Ad.tsx:29-31`, `33-59`).
- Deploy via gated script for safety: `pnpm deploy:prod` (see `ceo-magazine/scripts/deploy-gated.sh`).
- Linked articles and category routes are pre‑rendered; smoke checks validate key pages.
 - Trending Now links fixed: safe `/category/<cat>/<slug>` construction with defaults; non-link render when slug missing; prefetch disabled to avoid resource spikes (`ceo-magazine/app/category/[slug]/[article]/page.tsx:612-636`).
 - If Vercel CLI shows “Not authorized”, log in once (`npx vercel login`) and link the project (`npx vercel link --project ceo-magazine`).

### Sanity Studio Deployment

The Sanity Studio is embedded at `/studio` route and will be deployed automatically with your Next.js app.

## Project Structure

```
ceo-magazine/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with fonts
│   ├── page.tsx           # Homepage
│   ├── globals.css        # Global styles
│   └── studio/            # Sanity Studio route
├── components/            # React components
│   ├── Navigation.tsx     # Header navigation
│   └── Footer.tsx         # Footer component
├── lib/                   # Utility functions
│   ├── sanity.ts          # Sanity client config
│   └── types.ts           # TypeScript types
├── sanity/                # Sanity CMS configuration
│   ├── schemaTypes/       # Content schemas
│   └── env.ts             # Sanity environment config
├── public/                # Static assets
└── DESIGN_REFERENCE.md    # Design system documentation
```

## Development Tips

### Running Locally
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Sanity Commands
```bash
npx sanity deploy    # Deploy Studio to Sanity's hosting
npx sanity manage    # Open project in Sanity Management
```

## Performance Optimization

- ✅ Next.js Image optimization enabled
- ✅ Static page generation for articles
- ✅ Optimized fonts with next/font
- ✅ Minimal JavaScript bundle
- ✅ Fast CDN delivery via Vercel

## Customization

### Changing Colors
Edit colors in:
- `app/globals.css` (CSS variables)
- Components using Tailwind classes (e.g., `bg-[#082945]`)

### Changing Fonts
Edit fonts in `app/layout.tsx`

### Adding Features
- Newsletter integration: Add API route for email service
- Comments: Integrate Disqus or similar
- Analytics: Add Google Analytics or Plausible

## Support & Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Sanity Documentation](https://www.sanity.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Project Docs
- `STANDARDS.md` — Coding standards, image/hero policy, terminology (Writer-only)
- `OPERATIONAL_RULES.md` — Ops rules, cookies (`user-country`), routing conventions
- `PROJECT_DOCUMENTATION.md` — Architecture overview, data flow, terminology & policies
- `OPERATIONS_RUNBOOK.md` — Deployment runbook and operational procedures

---

**Built with ❤️ for global executives and business leaders**
## Spotlight Grid Policy (Featured Section)

- Source of truth: The homepage “C‑suite spotlight” grid uses only static assets from `public/Featured section/` and optional config `public/spotlight.json`.
- Stability rule: The 9 cards are fixed and do not auto‑change. No Sanity fetching or backfill is used for this section.
- Views rule: Featured section cards never display view counts. Views for other sections may be hardcoded or omitted per content rules.
- Config: `public/spotlight.json` should list exactly 9 items: `{ image, href?, title? }`. If missing or invalid, the component falls back to `/Featured%20section/1.png` … `/9.png` and links to `/archive`.
- Update procedure: Only update images or links via a PR that changes `public/Featured section/` files or `public/spotlight.json`. Preview locally before deploy.

## Deployment Automation Setup

We've implemented a GitHub Actions workflow to automatically clean up old Vercel preview deployments. This helps manage costs and keeps your Vercel dashboard tidy.

### Key Components:
- **Workflow File**: `.github/workflows/delete-old-vercel-deployments.yml`
- **Trigger**: Runs on pull request merge/close
- **What it does**: Uses Vercel CLI to safely remove non-aliased preview deployments
- **Required Secret**: `VERCEL_TOKEN` (added to GitHub repo secrets)

### Manual Trigger:
You can manually run the workflow from GitHub Actions tab:
1. Go to repo > Actions
2. Select "Delete Old Vercel Preview Deployments"
3. Click "Run workflow"

### Retention Policy Note:
Vercel deployment retention is configured at the team/project level via the Vercel dashboard (not directly via CLI). Set it in Project Settings > General > Deployment Retention to auto-expire old deployments (e.g., 7 days for previews).

For more details, see Vercel documentation on retention policies.

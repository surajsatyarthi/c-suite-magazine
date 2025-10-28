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
   - **Authors**: Add writer profiles with photos and bios
   - **Categories**: Create content categories (Leadership, Innovation, etc.)
   - **Articles**: Write and publish your magazine articles

### Content Types

#### Articles (Posts)
- Title, slug, excerpt
- Featured image with alt text
- Author reference
- Categories
- Rich text content
- Featured flag for homepage
- Read time
- SEO fields

#### Authors
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

---

**Built with ❤️ for global executives and business leaders**

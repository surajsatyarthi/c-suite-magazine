# Design System Reference

## Typography (from competitor analysis - theceomagazine.com)

### Primary Fonts

1. **Playfair Display** (serif) - Elegant headlines
   - Weight: 900
   - Usage: Main headlines, hero titles
   - Example: `font-family: "Playfair Display", serif`
   - Colors: 
     - Dark: `rgb(40, 40, 40)` - Size: 21px / Line: 28px
     - White: `rgb(255, 255, 255)` - Size: 36px / Line: 46px

2. **Roboto** (sans-serif) - Body and UI text
   - Weights: 400, 500, 700
   - Usage: Body text, captions, labels
   - Examples:
     - Body: Weight 400, Size: 15px / Line: 24px, Color: `rgb(255, 255, 255)`
     - Captions: Weight 400, Size: 11px, Color: `rgb(255, 255, 255)`
     - Headlines: Weight 700, Size: 40px / Line: 20px, Color: `rgb(104, 104, 104)`
     - Labels: Weight 700, Size: 13px / Line: 21px, Color: `rgb(208, 175, 33)`
     - Links: Weight 500, Size: 13px / Line: 21px, Color: `rgb(42, 100, 150)`

3. **Termina** (serif) - Accent/Premium elements
   - Weight: 600
   - Size: 16px / Line: 16px
   - Color: `rgb(42, 100, 150)`

4. **Aktiv Grotesk** (sans-serif) - Secondary UI
   - Weight: 400
   - Size: 11px / Line: 16px
   - Color: `rgb(255, 255, 255)`

5. **Poynter Oldstyle Display** - Editorial/Classic feel
   - Weight: 400
   - Size: 16px / Line: 20px
   - Color: `rgba(255, 255, 255, 0.99)`

## Color Palette

### Exact Competitor Colors (theceomagazine.com)
- **Primary Dark Blue**: `#082945` - Main backgrounds, headers, dark sections
- **Gold/Yellow**: `#c8ab3d` - Premium accents, categories, highlights
- **White**: `#ffffff` - Text, backgrounds, clean sections

### Additional Colors (from font analysis)
- **Dark Gray**: `rgb(40, 40, 40)` - Main headlines
- **Medium Gray**: `rgb(104, 104, 104)` - Secondary headlines
- **Off-white**: `rgba(255, 255, 255, 0.99)` - Body text
- **Alternative Gold**: `rgb(208, 175, 33)` / `#D0AF21` - Category badges
- **Alternative Blue**: `rgb(42, 100, 150)` / `#2A6496` - Links, CTAs

## Typography Scale (Recommended for our implementation)

We'll use similar elegant fonts available via Google Fonts:

### Next.js Font Implementation
```typescript
// Use Playfair Display for headlines
// Use Inter or Roboto for body (both elegant, modern, well-optimized)
// Use serif accents for premium feel
```

### Font Pairings
- **Headlines**: Playfair Display (900)
- **Body**: Inter or Roboto (400, 500, 700)
- **Accents**: Crimson Text or Lora (for editorial feel)

## Design Principles

1. **Elegant & Classic**: Serif headlines, generous whitespace
2. **Professional**: Clean sans-serif for readability
3. **Premium**: Gold/blue accents for exclusivity
4. **Readable**: Large line-heights, comfortable font sizes
5. **Mobile-friendly**: Responsive typography scale

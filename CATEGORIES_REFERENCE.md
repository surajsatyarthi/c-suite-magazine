# Categories Reference

This document contains the complete list of all categories available in the CEO Magazine Sanity CMS.

**Total Categories:** 28

## Complete Category List

| # | Category Name | Slug | Description | Color |
|---|---------------|------|-------------|-------|
| 1 | Automotive & Logistics | `automotive-logistics` | Explore Automotive & Logistics articles and insights | #475569 |
| 2 | BFSI | `bfsi` | Explore BFSI articles and insights | #082945 |
| 3 | Business | `business` | Explore Business articles and insights | #c8ab3d |
| 4 | CEO Woman | `ceo-woman` | Explore CEO Woman articles and insights | #db2777 |
| 5 | Changemakers | `changemakers` | Explore Changemakers articles and insights | #14b8a6 |
| 6 | Construction & Mining | `construction-mining` | Explore Construction & Mining articles and insights | #78716c |
| 7 | Cxo Interview | `cxo-interview` | *No description* | #c8ab3d |
| 8 | Education | `education` | Explore Education articles and insights | #6366f1 |
| 9 | Energy | `energy` | Explore Energy articles and insights | #eab308 |
| 10 | Engineering | `engineering` | Explore Engineering articles and insights | #64748b |
| 11 | Entrepreneurs | `entrepreneurs` | Explore Entrepreneurs articles and insights | #c8ab3d |
| 12 | Events | `events` | Explore Events articles and insights | #b39935 |
| 13 | Healthcare | `healthcare` | Explore Healthcare articles and insights | #dc2626 |
| 14 | IT & Telco | `it-telco` | Explore IT & Telco articles and insights | #3b82f6 |
| 15 | Innovation | `innovation` | Explore Innovation articles and insights | #2563eb |
| 16 | Leadership | `leadership` | Explore Leadership articles and insights | #082945 |
| 17 | Manufacturing | `manufacturing` | Explore Manufacturing articles and insights | #475569 |
| 18 | Money & Finance | `money-finance` | Explore Money & Finance articles and insights | #c8ab3d |
| 19 | Not-For-Profit | `not-for-profit` | Explore Not-For-Profit articles and insights | #10b981 |
| 20 | Opinion | `opinion` | *No description* | #082945 |
| 21 | Philanthropy | `philanthropy` | Explore Philanthropy articles and insights | #8b5cf6 |
| 22 | Professional Services | `professional-services` | Explore Professional Services articles and insights | #082945 |
| 23 | Property & Real Estate | `property-real-estate` | Explore Property & Real Estate articles and insights | #0891b2 |
| 24 | Public Sector | `public-sector` | Explore Public Sector articles and insights | #0f172a |
| 25 | Retail | `retail` | Explore Retail articles and insights | #ef4444 |
| 26 | Science & Technology | `science-technology` | Explore Science & Technology articles and insights | #0ea5e9 |
| 27 | Startups | `startups` | Explore Startups articles and insights | #f59e0b |
| 28 | Sustainability | `sustainability` | Explore Sustainability articles and insights | #22c55e |

## Category Schema Structure

Each category in the Sanity CMS has the following fields:

- **Title** (string, required): Display name of the category
- **Slug** (slug, required): URL-friendly identifier derived from title
- **Description** (text, optional): Brief description of the category
- **Color** (string, optional): Hex color code for category badges and styling

## Usage Notes

### In Code
Categories are referenced in posts using an array of references:
```typescript
categories: [
  { _type: 'reference', _ref: 'category-id-here' }
]
```

### In GROQ Queries
To fetch categories with posts:
```groq
*[_type == "post"] {
  title,
  "categories": categories[]->{title, slug, color}
}
```

### Static Category List (for generateStaticParams)
The following categories are hardcoded in `app/category/[slug]/page.tsx`:
```javascript
const categories = [
  'leadership', 'business', 'manufacturing', 'public-sector', 'events',
  'innovation', 'not-for-profit', 'philanthropy', 'it-telco', 'money-finance',
  'engineering', 'science-technology', 'sustainability',
  'professional-services', 'startups', 'retail', 'energy',
  'changemakers', 'ceo-woman', 'education', 'automotive-logistics',
  'healthcare', 'entrepreneurs', 'property-real-estate', 'bfsi', 'construction-mining'
]
```

## Special Categories

### CXO Interview
- **Slug:** `cxo-interview`
- **Purpose:** Specifically for executive interviews
- **Usage:** Used in the "Featured CXOs" section on homepage
- **Import:** Automatically assigned by `scripts/import-cxo-interviews.js`

### Opinion
- **Slug:** `opinion`
- **Purpose:** Opinion pieces and editorial content
- **Note:** No description set in CMS

## Color Palette

The categories use a diverse color palette for visual distinction:
- **Primary Brand Colors:** #082945 (dark blue), #c8ab3d (gold)
- **Industry Colors:** Various hex codes for different sectors
- **Accessibility:** All colors should meet WCAG contrast requirements

## Maintenance

This file was generated on: **January 2025**

To update this reference:
1. Query Sanity CMS: `*[_type == "category"] | order(title asc)`
2. Update this file with any new categories
3. Commit changes to version control

## Related Files

- `sanity/schemaTypes/categoryType.ts` - Category schema definition
- `app/category/[slug]/page.tsx` - Category page implementation
- `components/ArchiveFilters.tsx` - Category filtering logic
- `scripts/import-*.js` - Category assignment in import scripts
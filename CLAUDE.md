# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

85-Store is a modern select shop website built with Next.js 15, TypeScript, and Tailwind CSS. It uses Notion as a headless CMS for blog content management and optionally integrates with Shopify for e-commerce functionality.

**Key Technologies:**
- Next.js 15.5 with App Router
- TypeScript 5
- Tailwind CSS 3.4
- Notion API (`@notionhq/client`)
- Shopify Storefront API (`@shopify/storefront-api-client`)
- Sharp for image processing

## Development Commands

```bash
# Development server with Turbopack
npm run dev

# Production build (includes image download from Notion)
npm run build

# Production server
npm run start

# Lint
npm run lint

# Download Notion images (runs automatically during build)
npm run download-images
```

## Architecture

### Content Management Flow

**Notion → Next.js Pipeline:**
1. Blog posts and products are stored in separate Notion databases
2. Content is fetched via `/lib/notion.ts` using the Notion API
3. Images are downloaded at build time to `/public/notion-images/` via `scripts/download-notion-images.ts`
4. Image URL mapping is stored in `/lib/notion-image-mapping.json` to handle Notion's S3 URL expiration
5. Blog content is rendered using the `NotionRenderer` component which supports 20+ Notion block types

### Data Layer

**Key Files:**
- `/lib/notion.ts` - Notion API integration, blog post and product fetching
- `/lib/shopify.ts` - Shopify Storefront API integration
- `/lib/notion-images.ts` - Image URL mapping and processing
- `/types/notion.ts` - TypeScript interfaces for BlogPost and Product

**Notion Database Schema:**

Blog posts require these properties:
- `Title` (title) - Article title
- `Slug` (text) - URL identifier
- `Excerpt` (text) - Article summary
- `Date` (date) - Publication date
- `Author` (multi-select) - Author names
- `Category` (multi-select) - Categories
- `Tags` (multi-select) - Tags
- `Status` (multi-select) - Must be "Published" to appear
- `Views` (number) - Auto-updated page view count

Products require these properties:
- `Name` (title) - Product name
- `ShopifyHandle` (text) - Shopify product handle
- `Category` (select) - Product category
- `Price` (number) - Price in yen
- `Images` (files) - Product images
- `Description` (text) - Product description
- `Featured` (checkbox) - Display as featured
- `Status` (select) - Must be "Active" to appear

### Notion Image Handling

**Critical System:** Notion's S3 image URLs expire after ~1 hour. The system handles this via:

1. **Build-time Download:** `npm run download-images` downloads all Notion images to `/public/notion-images/`
2. **URL Mapping:** Original URLs are mapped to local paths in `notion-image-mapping.json`
3. **Runtime Fallback:** If an image URL expires, the system uses the image proxy API at `/app/api/image-proxy/route.ts`
4. **Automatic Rotation:** The download script uses Sharp to auto-rotate images based on EXIF data
5. **EXIF Stripping:** All EXIF metadata is removed for privacy and size reduction

### Rendering System

**NotionRenderer Component** (`/components/NotionRenderer.tsx`):
- Recursively renders Notion blocks with full type support
- Groups consecutive list items for proper HTML structure
- Handles nested blocks and column layouts
- Supports code blocks with syntax highlighting
- Renders embeds, bookmarks, and link previews

**Supported Block Types:**
- Text: paragraph, headings (h1-h3), lists (bulleted, numbered, checkboxes), quotes, callouts
- Media: images, videos, audio, files
- Embeds: bookmarks, link previews, external embeds (YouTube, Twitter)
- Code: code blocks with language specification
- Layout: dividers, table of contents, columns, toggles

### View Tracking

**Implementation:**
- Client-side tracking via `ViewTracker` component (loaded on blog post pages)
- API endpoint at `/app/api/views/[slug]/route.ts`
- Updates Notion database `Views` property in real-time
- Prevents duplicate counts within same session

### Shopify Integration

**Optional Feature:** The site can integrate with Shopify for:
- Product catalog display
- Inventory status
- Direct links to Shopify online store at `shop.85-store.com`

**Note:** Currently configured to link to Shopify rather than implement a full checkout flow.

## Environment Variables

Required variables are defined in `.env.example`:

**Essential:**
- `NOTION_API_KEY` - Notion integration token
- `NOTION_BLOG_DATABASE_ID` - Blog database ID
- `NEXT_PUBLIC_SITE_URL` - Site URL

**Optional:**
- `NOTION_PRODUCTS_DATABASE_ID` - Products database (for e-commerce)
- `SHOPIFY_STORE_DOMAIN` - Shopify store domain
- `SHOPIFY_STOREFRONT_ACCESS_TOKEN` - Shopify API token
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` - Email configuration
- `CONTACT_EMAIL` - Admin email for contact form

## Important Patterns

### Image Optimization

All images use Next.js `<Image>` component with:
- Automatic WebP conversion
- Responsive sizing
- Lazy loading
- Remote patterns configured in `next.config.ts` for Shopify, Notion, and S3 domains

### Color System

Notion's multi-select colors are mapped to Tailwind classes via `/utils/notionColors.ts`:
- `getCategoryStyleClasses(color)` - Returns category badge styles
- `getTagStyleClasses(color)` - Returns tag badge styles

### Static Generation

Blog posts use `generateStaticParams()` for static generation at build time. All blog routes are pre-rendered for optimal performance.

### API Routes Structure

- `/app/api/blocks/[blockId]/route.ts` - Fetch individual Notion blocks
- `/app/api/views/[slug]/route.ts` - View count tracking
- `/app/api/image-proxy/route.ts` - Proxy for expired Notion images
- `/app/api/og-image/[slug]/route.ts` - Dynamic OG images for sharing
- `/app/api/contact/route.ts` - Contact form submission

## Project-Specific Notes

### Japanese Language

This is a Japanese language site. All UI text, content, and documentation should be in Japanese unless specifically related to code/technical configuration.

### Blog vs Products

The system supports two content types:
1. **Blog posts** - Editorial content managed in Notion
2. **Products** - E-commerce items managed in Notion with Shopify integration

These are stored in separate Notion databases but share similar rendering pipelines.

### Styling Approach

- Tailwind CSS utility classes throughout
- Dark mode support via system preferences
- Mobile-first responsive design
- Color palette: Orange (#FF6B35), Charcoal (#2C3E50), Navy (#1E3A5F)

### Build Process

**Important:** The build command runs `download-images` before building. This:
1. Fetches all blog posts from Notion
2. Downloads all images to `/public/notion-images/`
3. Creates `/lib/notion-image-mapping.json` with URL mappings
4. Processes images (rotation, EXIF removal)
5. Then runs Next.js build

Never skip the image download step in production builds.

# Template Customization Guide

This guide will help you customize this template for your own project.

## Table of Contents

1. [Branding & Design](#branding--design)
2. [Site Information](#site-information)
3. [Navigation & Footer](#navigation--footer)
4. [Colors & Styling](#colors--styling)
5. [Images & Logo](#images--logo)
6. [Content Structure](#content-structure)
7. [Features to Remove/Keep](#features-to-removekeep)

---

## Branding & Design

### 1. Update Site Metadata

**File**: `app/layout.tsx`

```typescript
export const metadata: Metadata = {
  title: "Your Site Name - Your Tagline",
  description: "Your site description",
  // ... other metadata
};
```

### 2. Update Favicon & Icons

**Files to replace**:
- `app/icon.tsx` - 32x32 favicon
- `app/apple-icon.tsx` - 180x180 Apple icon
- `public/logo.svg` - Main logo file

**Quick start**: Replace the SVG paths in `icon.tsx` and `apple-icon.tsx` with your logo's SVG code.

### 3. Update Manifest

**File**: `public/manifest.json`

```json
{
  "name": "Your Site Name",
  "short_name": "Your Short Name",
  "description": "Your description",
  "start_url": "/",
  // ...
}
```

---

## Site Information

### 1. Company/Store Information

**File**: `components/Footer.tsx`

Update:
- Company name
- Address
- Phone number
- Email
- Social media links
- Business hours

### 2. About Page

**File**: `app/about/page.tsx`

Update the about page content with your own story, mission, and team information.

### 3. Contact Information

**File**: `app/contact/page.tsx`

Update:
- Contact form email destination
- Store location details
- Google Maps embed (if using)

---

## Navigation & Footer

### Header Navigation

**File**: `components/Header.tsx`

```typescript
const navItems = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  // Add or remove navigation items
];
```

### Footer Links

**File**: `components/Footer.tsx`

Update footer sections:
- Quick Links
- Information pages
- Legal pages (Terms, Privacy Policy)
- Social media icons

---

## Colors & Styling

### 1. Tailwind Color Palette

**File**: `tailwind.config.ts`

```typescript
colors: {
  primary: '#FF6B35',     // Your primary color
  secondary: '#2C3E50',   // Your secondary color
  navy: '#1E3A5F',        // Additional color
  // Add more custom colors
}
```

### 2. CSS Variables

**File**: `app/globals.css`

```css
:root {
  --primary: #FF6B35;
  --secondary: #2C3E50;
  /* Add more CSS variables */
}
```

### 3. Typography

**File**: `app/layout.tsx`

Replace fonts:

```typescript
import { YourFont } from "next/font/google";

const yourFont = YourFont({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-your-font",
});
```

Update in `tailwind.config.ts`:

```typescript
fontFamily: {
  sans: ['var(--font-your-font)', 'sans-serif'],
  // ...
}
```

---

## Images & Logo

### Logo Files

Replace these files with your own logo:

1. **Main Logo**: `public/logo.svg`
   - Used in header and footer
   - SVG format recommended for scalability

2. **Favicon**: `app/icon.tsx`
   - 32x32px
   - Update the SVG code inside the component

3. **Apple Icon**: `app/apple-icon.tsx`
   - 180x180px
   - Update the SVG code inside the component

### Hero Section Images

**Location**: `public/hero/`

Add your hero/banner images:
- Recommended size: 1920x1080px or larger
- WebP format recommended for better performance

Update in `components/HeroSection.tsx`:

```typescript
<Image
  src="/hero/your-hero-image.jpg"
  alt="Your alt text"
  // ...
/>
```

### Placeholder Image

**File**: `public/images/placeholder.svg`

Replace with your own placeholder design for blog posts without cover images.

---

## Content Structure

### Blog Categories

Update default categories in your Notion database:
- Fashion
- Lifestyle
- Shop Info
- Events
- News

Add your own categories that fit your business.

### Blog Tags

Common tags to consider:
- New Arrivals
- Trending
- Sale
- How-to
- Behind the Scenes

### Page Structure

**Existing pages**:
- Home (`app/page.tsx`)
- Blog (`app/blog/page.tsx`)
- About (`app/about/page.tsx`)
- Contact (`app/contact/page.tsx`)
- Shipping (`app/shipping/page.tsx`)
- Returns (`app/returns/page.tsx`)

**To add new pages**:
1. Create `app/your-page/page.tsx`
2. Add navigation link in `components/Header.tsx`
3. Add footer link in `components/Footer.tsx` (if needed)

---

## Features to Remove/Keep

### E-commerce Features (Optional)

If you don't need e-commerce:

1. **Remove Shopify integration**:
   - Delete env variables: `SHOPIFY_*`
   - Remove from `next.config.ts`: Shopify image domains
   - Remove products section from home page

2. **Keep blog only**:
   - Focus on blog posts
   - Remove product-related components
   - Simplify navigation

### Analytics

**Google Analytics**:
- Already integrated in `app/layout.tsx`
- Update `NEXT_PUBLIC_GA_ID` in `.env.local`

**Vercel Analytics**:
- Included by default
- No additional setup needed if deploying to Vercel

### Contact Form

**To disable**:
- Remove contact page: `app/contact/page.tsx`
- Remove from navigation
- Remove API route: `app/api/contact/route.ts`

**To keep**:
- Configure SMTP settings in `.env.local`
- Test with your email provider

---

## Notion Database Setup

### Required Properties for Blog

Your Notion blog database must have these properties:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| Title | Title | Yes | Post title |
| Slug | Text | Yes | URL slug (e.g., "my-first-post") |
| Excerpt | Text | Yes | Short description |
| Cover Image | Files | No | Cover image |
| Date | Date | Yes | Publication date |
| Author | Multi-select | Yes | Author name(s) |
| Category | Multi-select | Yes | Category |
| Tags | Multi-select | No | Tags |
| Status | Multi-select | Yes | Must include "Published" |
| Views | Number | No | Page views (auto-updated) |

### Optional: Products Database

For e-commerce features:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| Name | Title | Yes | Product name |
| ShopifyHandle | Text | Yes | Shopify product ID |
| Category | Select | Yes | Product category |
| Price | Number | Yes | Price |
| Images | Files | Yes | Product images |
| Description | Text | Yes | Product description |
| Featured | Checkbox | No | Featured product |
| Status | Select | Yes | "Active" to publish |

---

## Deployment Checklist

Before deploying to production:

- [ ] Update all branding (logo, colors, fonts)
- [ ] Update site metadata and SEO tags
- [ ] Replace placeholder content
- [ ] Set up Notion integration and databases
- [ ] Configure environment variables
- [ ] Test contact form
- [ ] Set up Google Analytics
- [ ] Test on mobile devices
- [ ] Check all links and navigation
- [ ] Set up custom domain
- [ ] Configure SSL/HTTPS
- [ ] Test image loading and optimization
- [ ] Review privacy policy and terms
- [ ] Set up error tracking (optional)
- [ ] Configure backups (optional)

---

## Environment Variables Checklist

Production environment variables to set:

- [ ] `NOTION_API_KEY` - Your Notion integration token
- [ ] `NOTION_BLOG_DATABASE_ID` - Your blog database ID
- [ ] `NEXT_PUBLIC_SITE_URL` - Your production URL
- [ ] `NEXT_PUBLIC_GA_ID` - Google Analytics ID (optional)
- [ ] `SMTP_*` - Email configuration (if using contact form)
- [ ] `CONTACT_EMAIL` - Where to receive contact form emails
- [ ] `SHOPIFY_*` - Shopify configuration (if using e-commerce)

---

## Quick Customization Steps

### Minimal Customization (30 minutes)

1. Update `app/layout.tsx` - Site metadata
2. Replace `public/logo.svg` - Your logo
3. Update `components/Footer.tsx` - Contact info
4. Configure `.env.local` - Environment variables
5. Create Notion database with required properties

### Standard Customization (2-3 hours)

Everything in minimal, plus:

1. Update colors in `tailwind.config.ts`
2. Replace hero images
3. Customize home page content
4. Update about page
5. Set up Google Analytics
6. Test contact form

### Full Customization (1 day)

Everything in standard, plus:

1. Custom typography
2. Additional pages
3. Custom components
4. SEO optimization
5. Performance tuning
6. Testing across devices

---

## Support & Resources

- **Next.js Documentation**: https://nextjs.org/docs
- **Notion API**: https://developers.notion.com
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Vercel Deployment**: https://vercel.com/docs

For issues specific to this template, check the GitHub repository or create an issue.

---

## License

This template is provided under the MIT License. Feel free to use it for personal or commercial projects.

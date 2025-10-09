# Branding & Configuration Guide

This document provides detailed instructions for customizing the visual identity of your site.

## Color Customization

### 1. Tailwind Configuration

**File**: `tailwind.config.ts`

```typescript
export default {
  theme: {
    extend: {
      colors: {
        // Primary brand color (buttons, links, accents)
        primary: {
          DEFAULT: '#FF6B35',
          dark: '#E85A24',
          light: '#FF8A5C',
        },
        // Secondary brand color (headings, important text)
        secondary: {
          DEFAULT: '#2C3E50',
          dark: '#1A252F',
          light: '#34495E',
        },
        // Additional colors
        navy: '#1E3A5F',
        accent: '#F39C12',
      },
    },
  },
};
```

### 2. CSS Variables

**File**: `app/globals.css`

```css
@layer base {
  :root {
    /* Brand Colors */
    --color-primary: 255 107 53; /* RGB values for FF6B35 */
    --color-secondary: 44 62 80;  /* RGB values for 2C3E50 */

    /* Text Colors */
    --color-text-primary: 0 0 0;
    --color-text-secondary: 107 114 128;

    /* Background Colors */
    --color-bg-primary: 255 255 255;
    --color-bg-secondary: 249 250 251;
  }

  /* Dark mode (optional) */
  .dark {
    --color-text-primary: 255 255 255;
    --color-text-secondary: 156 163 175;
    --color-bg-primary: 17 24 39;
    --color-bg-secondary: 31 41 55;
  }
}
```

### 3. Component-Level Colors

Update colors in specific components:

**Header**: `components/Header.tsx`
```typescript
className="bg-white text-secondary"  // Change background and text color
```

**Footer**: `components/Footer.tsx`
```typescript
className="bg-secondary text-white"  // Dark footer
// or
className="bg-gray-50 text-gray-900"  // Light footer
```

**Buttons**: Global button styles in `globals.css`
```css
.btn-primary {
  @apply bg-primary text-white hover:bg-primary-dark;
}

.btn-secondary {
  @apply bg-secondary text-white hover:bg-secondary-dark;
}

.btn-outline {
  @apply border-2 border-primary text-primary hover:bg-primary hover:text-white;
}
```

---

## Typography

### 1. Font Selection

**File**: `app/layout.tsx`

#### Using Google Fonts

```typescript
import { Inter, Playfair_Display } from "next/font/google";

// For body text
const inter = Inter({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

// For headings
const playfair = Playfair_Display({
  weight: ["400", "500", "700", "900"],
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

export default function RootLayout({ children }) {
  return (
    <html className={`${inter.variable} ${playfair.variable}`}>
      {/* ... */}
    </html>
  );
}
```

#### Using Custom Fonts

1. Place font files in `public/fonts/`
2. Import in layout:

```typescript
import localFont from "next/font/local";

const customFont = localFont({
  src: [
    {
      path: "../public/fonts/YourFont-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/YourFont-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-custom",
});
```

### 2. Typography Configuration

**File**: `tailwind.config.ts`

```typescript
export default {
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-heading)', 'serif'],
        custom: ['var(--font-custom)', 'sans-serif'],
      },
      fontSize: {
        'display': ['4rem', { lineHeight: '1.1', fontWeight: '700' }],
        'h1': ['3rem', { lineHeight: '1.2', fontWeight: '700' }],
        'h2': ['2.25rem', { lineHeight: '1.3', fontWeight: '600' }],
        'h3': ['1.875rem', { lineHeight: '1.4', fontWeight: '600' }],
        'body': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
      },
    },
  },
};
```

### 3. Global Typography Styles

**File**: `app/globals.css`

```css
@layer base {
  body {
    @apply font-sans text-body text-gray-900;
  }

  h1, h2, h3, h4, h5, h6 {
    @apply font-heading text-secondary;
  }

  h1 {
    @apply text-h1;
  }

  h2 {
    @apply text-h2;
  }

  h3 {
    @apply text-h3;
  }
}
```

---

## Logo & Icons

### 1. Logo Files

**Main Logo**: `public/logo.svg`

Replace with your logo SVG. Recommended specifications:
- Format: SVG (for scalability)
- Viewbox: 0 0 [width] [height]
- Keep it simple for small sizes

**Usage in Header**:
```typescript
<Image
  src="/logo.svg"
  alt="Your Brand Name"
  width={120}
  height={40}
  priority
/>
```

### 2. Favicon

**File**: `app/icon.tsx`

```typescript
export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ /* your favicon design */ }}>
        {/* SVG or text content */}
      </div>
    ),
    { width: 32, height: 32 }
  );
}
```

### 3. Apple Touch Icon

**File**: `app/apple-icon.tsx`

Similar to favicon but 180x180px.

### 4. Social Media Icons

**Location**: `components/Footer.tsx`

Using lucide-react icons:
```typescript
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";

<a href="https://facebook.com/yourpage">
  <Facebook className="w-5 h-5" />
</a>
```

---

## Images & Media

### 1. Hero Section

**Component**: `components/HeroSection.tsx`

```typescript
<Image
  src="/hero/hero-banner.jpg"
  alt="Hero description"
  fill
  className="object-cover"
  priority
  sizes="100vw"
/>
```

**Image specifications**:
- Size: 1920x1080px minimum
- Format: WebP (with JPG fallback)
- Compression: Optimized for web
- Location: `public/hero/`

### 2. Blog Post Images

**Placeholder**: `public/images/placeholder.svg`

Default image when blog posts don't have a cover image.

**Notion Images**:
- Uploaded to Notion databases
- Automatically proxied and cached
- No manual optimization needed

### 3. About Page Images

**Location**: `public/images/`

Team photos, store photos, etc.:
- Size: 800x600px recommended
- Format: WebP with JPG fallback
- Descriptive alt text required

---

## Layout & Spacing

### 1. Container Widths

**File**: `tailwind.config.ts`

```typescript
export default {
  theme: {
    extend: {
      maxWidth: {
        'container': '1280px',
        'narrow': '768px',
        'wide': '1536px',
      },
    },
  },
};
```

**Usage**: `app/globals.css`
```css
.max-container {
  @apply max-w-container mx-auto;
}

.section-padding {
  @apply px-4 md:px-6 lg:px-8;
}
```

### 2. Section Spacing

```css
.section {
  @apply py-16 md:py-20 lg:py-24;
}

.section-sm {
  @apply py-8 md:py-12 lg:py-16;
}

.section-lg {
  @apply py-24 md:py-32 lg:py-40;
}
```

---

## Button Styles

### Global Button Classes

**File**: `app/globals.css`

```css
@layer components {
  .btn {
    @apply px-6 py-3 rounded-lg font-semibold transition-all duration-200 inline-block text-center;
  }

  .btn-primary {
    @apply btn bg-primary text-white hover:bg-primary-dark;
  }

  .btn-secondary {
    @apply btn bg-secondary text-white hover:bg-secondary-dark;
  }

  .btn-outline {
    @apply btn border-2 border-primary text-primary hover:bg-primary hover:text-white;
  }

  .btn-ghost {
    @apply btn text-primary hover:bg-primary hover:bg-opacity-10;
  }

  .btn-sm {
    @apply px-4 py-2 text-sm;
  }

  .btn-lg {
    @apply px-8 py-4 text-lg;
  }
}
```

---

## Component-Specific Styling

### BlogCard

**File**: `components/BlogCard.tsx`

Customize card appearance:
```typescript
<article className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all">
  {/* Adjust border radius, shadow, hover effects */}
</article>
```

### CategorySection

**File**: `components/CategorySection.tsx`

Customize category badge colors:
```typescript
const getCategoryColor = (category: string) => {
  const colors = {
    'Fashion': 'bg-pink-100 text-pink-800',
    'Lifestyle': 'bg-blue-100 text-blue-800',
    'News': 'bg-green-100 text-green-800',
    // Add your categories
  };
  return colors[category] || 'bg-gray-100 text-gray-800';
};
```

---

## Responsive Design

### Breakpoints

**Tailwind defaults**:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

**Custom breakpoints** in `tailwind.config.ts`:
```typescript
export default {
  theme: {
    screens: {
      'xs': '480px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      '3xl': '1920px',
    },
  },
};
```

### Mobile-First Approach

Always start with mobile styles, then add larger screens:

```typescript
<div className="text-sm md:text-base lg:text-lg">
  {/* Mobile: sm, Tablet: base, Desktop: lg */}
</div>
```

---

## Dark Mode (Optional)

### Enable Dark Mode

**File**: `tailwind.config.ts`
```typescript
export default {
  darkMode: 'class', // or 'media' for system preference
  // ...
};
```

**File**: `app/globals.css`
```css
.dark {
  @apply bg-gray-900 text-white;
}

.dark .bg-white {
  @apply bg-gray-800;
}

.dark .text-gray-900 {
  @apply text-gray-100;
}
```

---

## Animation & Transitions

### Global Transitions

**File**: `app/globals.css`

```css
@layer utilities {
  .transition-smooth {
    @apply transition-all duration-300 ease-in-out;
  }

  .hover-lift {
    @apply hover:-translate-y-1 transition-transform;
  }

  .fade-in {
    animation: fadeIn 0.3s ease-in;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

---

## Testing Your Changes

1. **Development**: `npm run dev`
2. **Build**: `npm run build` (catch any errors)
3. **Test on devices**: Use Chrome DevTools device emulation
4. **Lighthouse**: Check performance and accessibility
5. **Cross-browser**: Test on Chrome, Firefox, Safari

---

## Best Practices

✅ **Do**:
- Use CSS variables for colors
- Follow mobile-first approach
- Test on multiple devices
- Optimize images before uploading
- Use semantic HTML
- Maintain consistent spacing

❌ **Don't**:
- Hardcode colors in components
- Use inline styles (use Tailwind classes)
- Skip accessibility features
- Use very large images
- Override Tailwind defaults unnecessarily

---

## Common Customizations

### Business Information

Update in `components/Footer.tsx`:
- Company name
- Address
- Phone
- Email
- Business hours

### Social Media Links

Update in `components/Footer.tsx`:
```typescript
const socialLinks = {
  facebook: 'https://facebook.com/yourpage',
  instagram: 'https://instagram.com/yourpage',
  twitter: 'https://twitter.com/yourpage',
};
```

### Navigation Menu

Update in `components/Header.tsx`:
```typescript
const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Blog', href: '/blog' },
  { label: 'Shop', href: '/shop' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];
```

---

This covers the main customization points. For more advanced customizations, refer to the Next.js and Tailwind CSS documentation.

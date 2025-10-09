# Notion Database Templates

This document provides templates for setting up your Notion databases.

## Blog Database Template

### Required Properties

Copy this table structure to create your Notion blog database:

| Property Name | Property Type | Options/Config | Required | Description |
|--------------|---------------|----------------|----------|-------------|
| **Title** | Title | - | ✅ | Blog post title (automatically created) |
| **Slug** | Rich Text | - | ✅ | URL-friendly identifier (e.g., "my-first-post") |
| **Excerpt** | Rich Text | - | ✅ | Short summary (150-200 characters) |
| **Cover Image** | Files & Media | - | ⚠️ | Post thumbnail (recommended) |
| **Date** | Date | Include time: No | ✅ | Publication date |
| **Author** | Multi-select | Options: Your Team | ✅ | Post author(s) |
| **Category** | Multi-select | Options: See below | ✅ | Primary category |
| **Tags** | Multi-select | Options: See below | ❌ | Additional tags |
| **Status** | Multi-select | Options: Draft, Published, Archived | ✅ | Publication status |
| **Views** | Number | Format: Number | ❌ | Page views (auto-updated) |

### Suggested Categories

Create these options in the **Category** property:

- 🎨 Fashion
- 🏠 Lifestyle
- 📰 News
- 🛍️ Shop Info
- 🎉 Events
- 💡 Tips & Guides
- 🎬 Behind the Scenes

**To add categories in Notion**:
1. Click on the Category property header
2. Click "Edit property"
3. Add each option with an emoji and name

### Suggested Tags

Create these options in the **Tags** property:

- ⭐ Featured
- 🆕 New Arrival
- 🔥 Trending
- 💰 Sale
- 🎁 Gift Guide
- 📸 Lookbook
- 🌟 Staff Pick
- ♻️ Sustainable
- 👕 Apparel
- 👟 Accessories

### Status Options

Create these options in the **Status** property:

- ✏️ Draft - Work in progress
- ✅ Published - Live on site
- 📁 Archived - Hidden from site

**Important**: Posts must have status "Published" to appear on the site.

### Example Blog Entry

| Field | Example Value |
|-------|---------------|
| Title | Summer Style Guide 2025 |
| Slug | summer-style-guide-2025 |
| Excerpt | Discover the hottest trends for summer 2025, from lightweight fabrics to vibrant colors. |
| Cover Image | [Upload your image] |
| Date | 2025-06-01 |
| Author | Jane Doe |
| Category | Fashion, Lifestyle |
| Tags | Trending, Lookbook, Summer |
| Status | Published |
| Views | 0 (will auto-increment) |

---

## Products Database Template (Optional)

### Required Properties

| Property Name | Property Type | Options/Config | Required | Description |
|--------------|---------------|----------------|----------|-------------|
| **Name** | Title | - | ✅ | Product name |
| **ShopifyHandle** | Rich Text | - | ✅ | Shopify product handle |
| **Category** | Select | Options: See below | ✅ | Product category |
| **Price** | Number | Format: Dollar | ✅ | Product price |
| **Images** | Files & Media | - | ✅ | Product images |
| **Description** | Rich Text | - | ✅ | Product description |
| **Featured** | Checkbox | - | ❌ | Show on homepage |
| **Status** | Select | Options: Active, Inactive | ✅ | Availability |
| **CreatedTime** | Created time | - | ❌ | Auto-generated |

### Product Categories

Create these options in the **Category** property:

- 👕 Tops
- 👖 Bottoms
- 👗 Dresses
- 🧥 Outerwear
- 👞 Footwear
- 👜 Bags & Accessories
- 🧢 Hats & Caps
- 💍 Jewelry
- 🕶️ Eyewear
- 🏠 Home Goods

### Status Options

- ✅ Active - Available for purchase
- ⏸️ Inactive - Not shown on site

### Example Product Entry

| Field | Example Value |
|-------|---------------|
| Name | Classic White T-Shirt |
| ShopifyHandle | classic-white-tshirt |
| Category | Tops |
| Price | 2980 |
| Images | [Upload product photos] |
| Description | Premium cotton t-shirt with a relaxed fit. Perfect for everyday wear. |
| Featured | ☑️ |
| Status | Active |

---

## Setting Up Your Database

### Step-by-Step Setup

#### 1. Create a New Database

1. Open Notion and create a new page
2. Type `/database` and select "Table - Inline"
3. Name your database (e.g., "Blog Posts")

#### 2. Add Properties

For each property in the template:

1. Click the **"+"** icon to add a new property
2. Enter the property name
3. Select the property type from the dropdown
4. Configure options (for Select/Multi-select properties)

#### 3. Configure Multi-Select Options

For properties like Category, Tags, Author, Status:

1. Click on the property name
2. Click "Edit property"
3. Click "+ Add an option"
4. Enter the option name
5. Choose a color (optional)
6. Repeat for all options

#### 4. Set Up Integration

1. Go to [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click "New integration"
3. Name it (e.g., "85store")
4. Select your workspace
5. Copy the "Internal Integration Token"
6. Go back to your database
7. Click the "..." menu (top right)
8. Select "Connect to" → Choose your integration

#### 5. Get Database ID

1. Open your database as a full page
2. Copy the URL
3. Extract the database ID:
   ```
   https://www.notion.so/workspace/DatabaseName-[DATABASE_ID]?v=...
   ```
4. The DATABASE_ID is the 32-character string after the database name
5. Add it to your `.env.local` file

---

## Content Structure Tips

### Blog Post Structure

Use these Notion blocks in your blog posts:

**Header Section**:
- Heading 1: Main title (auto-populated from Title property)
- Paragraph: Introduction/hook

**Content**:
- Heading 2: Section titles
- Heading 3: Subsection titles
- Paragraph: Body text
- Bulleted list: Key points
- Numbered list: Step-by-step guides
- Quote: Highlights or testimonials
- Callout: Important notes or tips

**Media**:
- Image: Photos (with captions)
- Video: YouTube/Vimeo embeds
- Bookmark: External links with preview
- Divider: Section separators

**Example Structure**:

```
📄 How to Style Your Summer Wardrobe

[Introduction paragraph]

## Essential Pieces

[Content about essential pieces]

### 1. Lightweight Fabrics

[Details about fabrics]

[Image: fabric samples]

### 2. Versatile Colors

[Details about colors]

[Image: color palette]

## Styling Tips

- Tip 1
- Tip 2
- Tip 3

> "Fashion is about dressing according to what's fashionable. Style is more about being yourself."

[Divider]

## Conclusion

[Wrap-up paragraph]
```

---

## Database Views

### Recommended Views

Create different views in Notion for easier management:

#### 1. Published Posts View
- Filter: Status = Published
- Sort: Date descending
- Use for: See what's live on the site

#### 2. Draft Posts View
- Filter: Status = Draft
- Sort: Created time descending
- Use for: Work in progress

#### 3. By Category View
- Group by: Category
- Sort: Date descending
- Use for: Organize content by topic

#### 4. Calendar View
- Display: Calendar
- Date property: Date
- Use for: Content planning

#### 5. Most Viewed View
- Sort: Views descending
- Limit: 10
- Use for: See popular content

---

## Bulk Import Template

### CSV Template for Blog Posts

```csv
Title,Slug,Excerpt,Date,Author,Category,Tags,Status
"My First Post","my-first-post","This is my first blog post",2025-01-15,"John Doe","News","Featured,New","Published"
"Summer Collection","summer-collection","Check out our summer collection",2025-06-01,"Jane Smith","Shop Info","New Arrival,Featured","Published"
```

**To import**:
1. Save as CSV file
2. In Notion, click "..." on database
3. Select "Merge with CSV"
4. Upload your file
5. Map columns to properties

---

## Best Practices

### Slugs

✅ **Good slugs**:
- `summer-style-guide-2025`
- `how-to-care-for-leather-bags`
- `new-store-opening-tokyo`

❌ **Bad slugs**:
- `Summer Style Guide 2025` (has spaces)
- `post-123` (not descriptive)
- `日本語タイトル` (avoid non-ASCII)

**Slug rules**:
- Use lowercase only
- Replace spaces with hyphens
- No special characters
- Keep it descriptive
- Keep it unique

### Excerpts

- Length: 150-200 characters
- Include key points
- Make it engaging
- Avoid clickbait
- No HTML or formatting

### Cover Images

- Size: 1200x630px minimum
- Format: JPG or PNG
- File size: < 500KB
- Aspect ratio: 16:9 or 1:1
- High quality, relevant to content

### Content

- Use proper headings (H2, H3)
- Break up long paragraphs
- Include images every 300-500 words
- Add alt text to images
- Link to related posts
- Proofread before publishing

---

## Troubleshooting

### Posts not appearing on site

Check:
1. Status is set to "Published"
2. Date is not in the future
3. Database is connected to integration
4. All required fields are filled

### Images not loading

Check:
1. Image is uploaded to Notion (not just a link)
2. Image file size is reasonable (< 5MB)
3. Integration has access to the database

### Slugs causing errors

Check:
1. Slug is unique (no duplicates)
2. Slug only contains lowercase letters, numbers, and hyphens
3. Slug is not empty

---

## Migration Guide

### From WordPress

1. Export posts as CSV from WordPress
2. Clean up data:
   - Remove HTML from content
   - Generate slugs
   - Format dates (YYYY-MM-DD)
3. Import to Notion database
4. Manually add images and formatting
5. Test each post

### From Other CMS

1. Export data in CSV or JSON format
2. Map fields to Notion properties
3. Convert content to Notion blocks
4. Import using Notion API or CSV import
5. Review and test

---

## Additional Resources

- [Notion API Documentation](https://developers.notion.com)
- [Notion Database Guide](https://www.notion.so/help/databases)
- [Content Planning Templates](https://www.notion.so/templates)

---

**Need Help?**

If you encounter issues setting up your Notion database:
1. Check this documentation
2. Review the main README.md
3. Check Notion API documentation
4. Create an issue on GitHub


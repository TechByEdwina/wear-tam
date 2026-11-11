# wear.TAM — Technical Documentation
**The Alisa Musa | Put Together Every Day**

> This document contains the full technical overview of the wear.TAM website — what has been built, how it works, what is planned, and how to continue development. Any developer or AI picking this up should read this document in full before touching the code.

---

## 1. Project Overview

| Field | Detail |
|---|---|
| Brand Name | wear.TAM (The Alisa Musa) |
| Tagline | Put Together Every Day |
| Type | Fashion e-commerce website |
| Stage | MVP — live on Netlify |
| Started | October 2026 |
| Location | Abuja, Nigeria |

### Brand Identity
- **Logo style:** Script "wear." + bold serif "TAM" — rendered in CSS using Google Fonts (no image file yet; a transparent PNG version of the logo is needed)
- **Colour Palette (Palette 1 — Timeless Luxury):**
  - Pure Black: `#000000`
  - Off-White Bone: `#F5F5F0`
  - Charcoal Grey: `#2B2B2B`
  - Champagne Gold: `#C5AB80`
- **Typography:**
  - Headings: Cormorant Garamond (serif, editorial)
  - Body: DM Sans (clean geometric sans-serif)
  - Script accent: Dancing Script (used in logo "wear.")
- **Design direction:** Editorial luxury meets premium streetwear — minimal, intentional, fashion-forward

---

## 2. Current Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Pure HTML5, CSS3, Vanilla JavaScript (ES6+) |
| Fonts | Google Fonts (CDN) |
| Icons | Font Awesome 6.5.0 (CDN) |
| Hosting | Netlify (static site deployment) |
| Backend | None yet — planned with Supabase |
| Database | None yet — planned with Supabase |
| Payments | Paystack (payment link — placeholder, not yet wired) |
| Version control | Git |

**No frameworks. No build tools. No npm.** The site is three files and runs directly in any browser.

---

## 3. File Structure

```
thealisamusa/
├── index.html                  # Single page — entire website
├── TAM-TECHNICAL-DOCS.md       # This document
└── assets/
    ├── css/
    │   └── style.css           # All styles (~750 lines)
    ├── js/
    │   └── main.js             # All JavaScript (~450 lines)
    └── images/
        ├── product-trousers-1.jpg.jpg   # Close-up floor shot (trousers + heels)
        ├── product-trousers-2.jpg.jpg   # Mirror selfie (full outfit)
        ├── TAM logo.jpeg                # Logo doc image (NOT used — see note)
        └── TAM-video.mp4               # Hero section background video
```

### Note on the logo file
`TAM logo.jpeg` contains the logo on a white document/paper background. It cannot be used directly as a web logo because of the background. The brand needs a **transparent PNG or SVG export** of the logo artwork. Until then, the CSS text logo (`wear.TAM`) is used in the nav and footer.

---

## 4. Site Architecture

The site is a **single-page application (SPA-style)** — one `index.html` with all sections stacked vertically. Navigation uses smooth anchor scroll. No page reloads.

### Sections in order

| Section | ID | Description |
|---|---|---|
| Navigation | `#nav` | Sticky, transparent on hero, bone background on scroll. Logo + links + cart icon + hamburger (mobile) |
| Hero | `#home` | Full-screen video background (TAM-video.mp4), dark overlay, animated headline, CTA buttons |
| Marquee ticker | — | Scrolling text strip: "wear.TAM · The Alisa Musa · Put Together Every Day · New Collection 2026" |
| Collection / Shop | `#collection` | Product grid with filter tabs, product cards, hover effects, quick add |
| Brand Story | `#story` | Split layout — image left, brand copy right, values, stat block |
| Features Strip | — | 4 trust signals: delivery, returns, secure payment, size inclusive |
| Lookbook | `#lookbook` | Horizontal drag-scroll gallery of 6 editorial cards |
| Testimonials | `#testimonials` | 3 customer review cards |
| Instagram / Socials | `#social` | 6-tile grid linking to Instagram, "Follow on Instagram" CTA |
| Newsletter | — | Email signup form (frontend only, no service connected yet) |
| Contact | `#contact` | Brand contact info + contact form (frontend only) |
| Footer | — | Logo, links (Shop, Help, Brand), social icons, copyright |

### Overlays / Modals

| Component | Trigger | Description |
|---|---|---|
| Cart Drawer | Cart icon in nav | Slides in from right. Shows items, total, checkout button |
| Product Modal | "View" button or product card | Full product detail: image gallery, size selector (standard or custom measurements), Add to Bag, Buy Now |
| Page Loader | On every page load | Brand logo animation fades out after 1.2s |

---

## 5. JavaScript Modules (main.js)

All JS is vanilla, written in self-executing IIFEs (Immediately Invoked Function Expressions) to avoid global scope pollution.

| Module | What it does |
|---|---|
| `initLoader` | Fades out the loader overlay on window load |
| `initCursor` | Custom cursor (dot + follower ring) — disabled on touch devices |
| `initNav` | Scroll-aware nav (transparent to bone), hamburger menu, active link highlighting |
| `initReveal` | IntersectionObserver — animates elements into view on scroll |
| `cart` object | Full cart state: add, remove, save to localStorage, load from localStorage, updateUI |
| `initCartDrawer` | Opens/closes cart drawer, handles item removal |
| `initProductModal` | Opens product modal, populates with product data, handles image thumbnails, size selection |
| `initSizeModeToggle` | Toggles between Standard Size and My Measurements panels |
| `initFilterTabs` | Filters product grid by category |
| `initLookbookDrag` | Mouse drag-to-scroll on lookbook strip |
| `initNewsletter` | Newsletter form submit handler (currently just shows toast) |
| `initContactForm` | Contact form submit handler (currently just shows toast) |
| `showToast` | Utility — shows bottom notification toast |
| `escapeHtml` | Security utility — sanitises strings before inserting into DOM |

### Product Data
Products are currently **hardcoded in `main.js`** as a `products` object (key = product ID). This is a placeholder. When Supabase is added, products will be fetched from the database.

Current products:
| ID | Name | Price | Category |
|---|---|---|---|
| 1 | The TAM Wide-Leg Trouser | ₦45,000 | sets |
| 2 | TAM Trouser + Shirt Set | ₦62,000 | sets |
| 3 | TAM Co-ord Set | ₦62,000 | sets |
| 4 | The Bone Blazer | ₦75,000 | outerwear |
| 5 | Gold Drape Midi | ₦52,000 | dresses |
| 6 | Charcoal Corset Top | ₦22,000 | tops |

Products 1 and 2 use real photos. Products 3–6 use CSS gradient placeholders until real photos are provided.

### Cart Persistence
Cart is saved to `localStorage` under the key `tam_cart`. It persists across page refreshes. Cleared when items are removed.

---

## 6. Size and Measurements System

The product modal has a **two-mode size selector:**

### Mode 1 — Standard Size
Button grid: XS / S / M / L / XL / 2XL / 3XL

### Mode 2 — My Measurements
10 optional fields, all in centimetres:

| Field | Nigerian tailor context |
|---|---|
| Bust | Fullest part of chest |
| Waist | Narrowest part of torso |
| Hips | Fullest part of hips/seat |
| Height | Full body height |
| Shoulder Width | Across back, shoulder to shoulder |
| Sleeve Length | Shoulder to wrist |
| Thigh | Fullest part of thigh |
| Inseam | Crotch to floor |
| Back Length | Nape of neck to waist |
| Neck | Base of neck circumference |

When a customer adds to bag with measurements, the cart item's "size" field is set to a string like:
`"Custom (Bust: 92cm, Waist: 74cm, Hips: 98cm)"`

This is currently stored in localStorage only. When Supabase is added, measurements should be saved to the user's profile for reuse.

---

## 7. Payments

Payment is handled via **Paystack payment link** — a static URL that Paystack generates which takes the customer to a hosted payment page.

### Current state
All payment buttons ("Buy Now" in the modal and "Proceed to Payment" in the cart) link to `'#'` as a placeholder.

### How to update
1. Generate a payment link at [Paystack.com](https://Paystack.com)
2. In `main.js`, update each product's `paymentLink` field:
```js
paymentLink: 'https://Paystack.com/pay/YOUR_LINK_HERE'
```
3. The cart's checkout button is in `cart.updateUI()` — update `checkoutBtn.href`

### Future plan
Replace the static Paystack link with the **Paystack API** (inline checkout) so the payment modal opens directly on the site without redirecting. This requires a Paystack public key and a small server-side function (can be a Netlify Function).

---

## 8. Contact Details (live)

| Type | Value |
|---|---|
| Phone | +234 814 363 1189 |
| WhatsApp | https://wa.me/2348143631189 |
| Instagram | https://www.instagram.com/wear.tam |
| Email | hello@weartam.com (placeholder — update with real email) |
| Location | Abuja, Nigeria |

Social links for TikTok, Twitter/X, Facebook, and Pinterest are present in the HTML but still set to `href="#"` — update when handles are available.

---

## 9. Hosting

**Platform:** Netlify
**Type:** Static site (no server-side rendering)
**Deploy method:** Connect GitHub repo to Netlify, auto-deploys on push to main branch

The site is pure static files so Netlify serves it directly with no build step needed.

---

## 10. Planned Backend — Supabase

This is the next major phase of development.

### Why Supabase
- Free tier handles TAM's current scale easily
- Built-in authentication (email/password, Google OAuth)
- PostgreSQL database with a clean API
- Works perfectly with vanilla JS — no framework needed
- Netlify + Supabase is a well-documented, production-proven stack

### Supabase project setup steps
1. Create account at [supabase.com](https://supabase.com)
2. Create a new project (name: `weartam`, region: closest to Nigeria — likely EU West)
3. Note down: `SUPABASE_URL` and `SUPABASE_ANON_KEY` (public key, safe to use in frontend JS)
4. Create the tables below

### Database Schema

#### Table: `profiles`
Extends Supabase's built-in `auth.users` table.
```sql
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  phone text,
  delivery_address text,
  created_at timestamp with time zone default now()
);
```

#### Table: `measurements`
```sql
create table measurements (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  bust numeric,
  waist numeric,
  hips numeric,
  height numeric,
  shoulder_width numeric,
  sleeve_length numeric,
  thigh numeric,
  inseam numeric,
  back_length numeric,
  neck numeric,
  updated_at timestamp with time zone default now()
);
```

#### Table: `products`
```sql
create table products (
  id serial primary key,
  name text not null,
  description text,
  price numeric not null,
  category text,
  images text[],           -- array of image URLs (stored in Supabase Storage)
  badge text,              -- 'new', 'bestseller', 'limited', 'sale', null
  in_stock boolean default true,
  sale_price numeric,      -- null if not on sale
  created_at timestamp with time zone default now()
);
```

#### Table: `orders`
```sql
create table orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users,   -- null for guest orders
  customer_name text,
  customer_email text,
  customer_phone text,
  items jsonb,             -- array of {product_id, name, size/measurements, price, qty}
  total numeric,
  delivery_address text,
  status text default 'pending',  -- pending, processing, shipped, delivered
  payment_ref text,        -- Paystack transaction reference
  created_at timestamp with time zone default now()
);
```

### Row Level Security (RLS)
Enable RLS on all tables. Key policies:
- Users can only read/write their own `profiles` and `measurements`
- `products` table is publicly readable, writable only by admin role
- `orders` are readable by the order's owner and by admin

---

## 11. Planned: Authentication (Phase 2)

### What to build
- Login modal (email + password)
- Sign up modal (name, email, password)
- Forgot password flow (Supabase sends reset email — needs live Netlify URL)
- Persistent session (Supabase JS handles this with localStorage)
- Nav updates: person icon shows "Log In" when logged out, user's first name when logged in

### New files needed
```
assets/js/auth.js       # Supabase auth logic
assets/js/supabase.js   # Supabase client init (import from CDN)
account.html            # User account page
```

### Auth flow
```
User clicks "Log In" in nav
  → Modal opens
  → Enters email + password
  → Supabase.auth.signInWithPassword()
  → On success: modal closes, nav updates, measurements pre-fill
  → Session stored in localStorage by Supabase client
  → On page refresh: session auto-restored
```

---

## 12. Planned: Admin Panel (Phase 3)

A separate password-protected dashboard for the brand owner.

### Access
- Separate URL: `weartam.netlify.app/admin`
- Protected by Supabase auth with an `is_admin` flag on the user's profile
- Only accounts with `is_admin = true` can access it

### Admin panel features

#### Products manager
- View all products in a table
- Add new product: upload photos (to Supabase Storage), set name, price, category, badge, stock status
- Edit existing product
- Toggle in stock / out of stock
- Set sale price (triggers "On Sale" badge on the storefront)
- Delete product

#### Orders manager
- View all incoming orders
- Filter by status (pending, processing, shipped, delivered)
- Click an order to see full details: customer info, items, measurements if provided, delivery address
- Update order status (triggers status change in DB)

#### Customers manager
- View all registered users
- See their saved measurements
- View their order history

#### Content manager (optional later)
- Update hero video
- Update lookbook photos

### New files needed
```
admin/
├── index.html          # Admin dashboard
├── products.html       # Products management
├── orders.html         # Orders management
├── customers.html      # Customers management
└── assets/
    ├── admin.css
    └── admin.js
```

---

## 13. Pending / To-Do List

### Immediate (before or just after launch)
- [ ] Replace placeholder email `hello@weartam.com` with real email address
- [ ] Add Paystack payment link to all products
- [ ] Add TikTok, Twitter/X, Facebook handles to social icon links
- [ ] Get logo exported as transparent PNG or SVG for proper use in nav/footer
- [ ] Replace product gradient placeholders (products 3–6) with real photos

### Phase 2 — Backend
- [ ] Create Supabase project
- [ ] Set up database tables (schema above)
- [ ] Add `supabase-js` client via CDN
- [ ] Build login/signup modals
- [ ] Wire auth to nav (person icon)
- [ ] Build account page (`account.html`)
- [ ] Save/load measurements from Supabase
- [ ] Move products from hardcoded JS to Supabase products table
- [ ] Save orders to Supabase on checkout

### Phase 3 — Admin Panel
- [ ] Build admin dashboard
- [ ] Products CRUD with image upload to Supabase Storage
- [ ] Orders management with status updates
- [ ] Customers view

### Phase 4 — Payments upgrade
- [ ] Replace Paystack static link with Paystack inline checkout (API)
- [ ] Save Paystack transaction reference to orders table
- [ ] Auto-update order status on successful payment webhook

### Nice to have (future)
- [ ] Wishlist / saved items
- [ ] Email notifications on order (via Supabase Edge Functions + Resend)
- [ ] Size guide modal with measurement diagram
- [ ] Blog / editorial content section
- [ ] Multi-image upload per product (currently single image)
- [ ] Search functionality

---

## 14. Key Design Decisions Made

| Decision | Choice | Reason |
|---|---|---|
| Framework | None (vanilla JS) | Fastest load, no build tools, easy to hand off |
| Single page vs multi page | Single page | Premium feel, smooth scroll, faster for MVP |
| Payment | Paystack link | Nigerian payment processor, no backend needed for MVP |
| Logo display | CSS text logo | Real logo file has white background, transparent export needed |
| Size system | Dual mode (standard + custom measurements) | Serves both ready-to-wear and made-to-order customers |
| Hosting | Netlify | Free, fast, auto-deploys from Git |
| Backend (planned) | Supabase | Free tier, built-in auth, works with vanilla JS, Nigerian-friendly |
| Cursor | Custom CSS cursor | Elevates the editorial fashion feel on desktop |
| Hero | Video background with dark overlay | More premium and immersive than static image |

---

## 15. External Dependencies

All loaded via CDN — no npm, no package.json.

| Dependency | Version | URL | Used for |
|---|---|---|---|
| Google Fonts | Latest | fonts.googleapis.com | Cormorant Garamond, DM Sans, Dancing Script |
| Font Awesome | 6.5.0 | cdnjs.cloudflare.com | All icons throughout the site |
| Supabase JS | TBD | cdn.jsdelivr.net/npm/@supabase/supabase-js | To be added in Phase 2 |

---

## 16. Browser and Device Support

| Target | Support level |
|---|---|
| Chrome (latest) | Full |
| Firefox (latest) | Full |
| Safari (latest) | Full |
| Edge (latest) | Full |
| Mobile Chrome (Android) | Full — mobile-first CSS |
| Mobile Safari (iOS) | Full — uses `dvh` units for proper viewport height |
| IE 11 | Not supported |

Custom cursor is automatically disabled on touch/mobile devices via `matchMedia('(pointer: coarse)')`.

---

## 17. Performance Notes

- Fonts loaded with `preconnect` hints for speed
- Images should be optimised to WebP format when real photos are added
- Hero video should be compressed — target under 10MB for fast load
- No JavaScript frameworks means no bundle overhead
- Netlify CDN handles global delivery

---

*Document last updated: October 2026*
*Prepared for wear.TAM — The Alisa Musa*

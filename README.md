# 👟 Highpoint Shoes — E-Commerce Web App

A full-stack, mobile-first e-commerce web application built for a shoe store.
Customers can browse products, filter by category/size, add to cart, and place
orders (Cash on Delivery). Admins manage everything through a protected dashboard.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS (mobile-first) |
| Backend | Supabase (PostgreSQL + Auth + Storage) |
| Routing | React Router v6 |
| Cart State | React Context + localStorage |
| Icons | react-icons (Hi, Fa, Gi) |
| Carousel | Embla Carousel + Autoplay |
| Ordering | WhatsApp deep link + Supabase orders table |

---

## 📁 Project Structure
```
highpoint-shoes/
├── public/
│   └── banners/
│       ├── mobile-banner.jpg     ← Homepage banner (mobile)
│       └── pc-banner.jpg         ← Homepage banner (desktop)
├── src/
│   ├── admin/
│   │   ├── components/
│   │   │   ├── AdminLayout.tsx   ← Admin shell with sidebar
│   │   │   └── Sidebar.tsx       ← Admin navigation
│   │   └── pages/
│   │       ├── AdminLogin.tsx    ← Admin sign-in page
│   │       ├── Dashboard.tsx     ← Stats overview
│   │       ├── Products.tsx      ← Product CRUD
│   │       ├── Banners.tsx       ← Banner CRUD
│   │       ├── Gallery.tsx       ← Gallery CRUD
│   │       ├── Orders.tsx        ← Order management
│   │       └── SizesSubcategories.tsx
│   ├── components/
│   │   ├── Navbar.tsx            ← Sticky nav with cart badge + search
│   │   ├── Footer.tsx
│   │   ├── WhatsAppButton.tsx    ← Floating WhatsApp CTA
│   │   ├── ProductCard.tsx       ← Minimal card (image + name + price)
│   │   ├── BannerCarousel.tsx    ← Auto-play hero carousel
│   │   ├── Lightbox.tsx          ← Full-screen gallery viewer
│   │   └── SearchOverlay.tsx     ← Full-screen search with recent + trending
│   ├── context/
│   │   ├── AuthContext.tsx       ← Supabase auth state
│   │   └── CartContext.tsx       ← Cart state + localStorage persistence
│   ├── hooks/
│   │   └── useAuth.ts            ← Re-exports useAuth hook
│   ├── lib/
│   │   └── supabase.ts           ← Supabase client
│   ├── pages/
│   │   ├── Home.tsx              ← Landing page
│   │   ├── Products.tsx          ← Product listing + filters + sort + search
│   │   ├── ProductDetail.tsx     ← Single product page
│   │   ├── Gallery.tsx           ← Image gallery with lightbox
│   │   ├── About.tsx
│   │   ├── Contact.tsx
│   │   ├── Cart.tsx              ← Cart page
│   │   ├── Checkout.tsx          ← Order form (COD)
│   │   └── OrderSuccess.tsx      ← Post-order confirmation
│   ├── types/
│   │   └── index.ts              ← All TypeScript interfaces
│   ├── App.tsx                   ← Routes
│   ├── main.tsx                  ← Entry point
│   └── index.css                 ← Tailwind + global styles
├── .env                          ← Environment variables (never commit)
├── .env.example                  ← Safe template to share
├── index.html
├── tailwind.config.js
├── postcss.config.js
├── vite.config.ts
└── README.md
```

---

## ⚙️ Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/your-username/highpoint-shoes.git
cd highpoint-shoes
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables

Copy the example env file and fill in your Supabase credentials:
```bash
cp .env.example .env
```
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
VITE_WHATSAPP_NUMBER=94XXXXXXXXX
VITE_STORE_NAME=Highpoint Shoes
```

> ⚠️ Never commit your `.env` file. It is already in `.gitignore`.

### 4. Set up Supabase

Go to your [Supabase dashboard](https://supabase.com/dashboard) and run the
SQL in the section below to create all tables, storage buckets, and seed data.

### 5. Add banner images

Place your banner images in the `public/banners/` folder:
```
public/
└── banners/
    ├── mobile-banner.jpg   ← shown on phones
    └── pc-banner.jpg       ← shown on desktop
```

### 6. Start the development server
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 7. Create an admin user

Go to **Supabase Dashboard → Authentication → Users → Add User** and create
a user with email and password. Use those credentials to log in at `/admin/login`.

---

## 🗄️ Supabase Setup

Run this SQL in your **Supabase SQL Editor**:
```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Categories
create table categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  created_at timestamptz default now()
);

-- Subcategories
create table subcategories (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid references categories(id) on delete cascade,
  name text not null,
  slug text not null,
  created_at timestamptz default now()
);

-- Sizes
create table sizes (
  id uuid primary key default uuid_generate_v4(),
  label text not null,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Products
create table products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  price numeric(10,2) not null,
  category_id uuid references categories(id) on delete set null,
  subcategory_id uuid references subcategories(id) on delete set null,
  image_url text,
  is_featured boolean default false,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Product Sizes (junction table)
create table product_sizes (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade,
  size_id uuid references sizes(id) on delete cascade,
  unique(product_id, size_id)
);

-- Banners
create table banners (
  id uuid primary key default uuid_generate_v4(),
  title text,
  image_url text not null,
  link text,
  sort_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Gallery
create table gallery (
  id uuid primary key default uuid_generate_v4(),
  image_url text not null,
  caption text,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Customers
create table customers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  phone text not null,
  address text,
  created_at timestamptz default now()
);

-- Orders
create table orders (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references customers(id) on delete set null,
  product_id uuid references products(id) on delete set null,
  size_id uuid references sizes(id) on delete set null,
  quantity int default 1,
  status text default 'pending',
  notes text,
  created_at timestamptz default now()
);

-- Storage buckets
insert into storage.buckets (id, name, public) values ('products', 'products', true);
insert into storage.buckets (id, name, public) values ('banners', 'banners', true);
insert into storage.buckets (id, name, public) values ('gallery', 'gallery', true);

-- Storage policies (public read)
create policy "Public read products" on storage.objects for select using (bucket_id = 'products');
create policy "Public read banners"  on storage.objects for select using (bucket_id = 'banners');
create policy "Public read gallery"  on storage.objects for select using (bucket_id = 'gallery');

-- Storage policies (authenticated upload)
create policy "Auth upload products" on storage.objects for insert with check (bucket_id = 'products' and auth.role() = 'authenticated');
create policy "Auth upload banners"  on storage.objects for insert with check (bucket_id = 'banners'  and auth.role() = 'authenticated');
create policy "Auth upload gallery"  on storage.objects for insert with check (bucket_id = 'gallery'  and auth.role() = 'authenticated');

-- Storage policies (authenticated delete)
create policy "Auth delete products" on storage.objects for delete using (bucket_id = 'products' and auth.role() = 'authenticated');
create policy "Auth delete banners"  on storage.objects for delete using (bucket_id = 'banners'  and auth.role() = 'authenticated');
create policy "Auth delete gallery"  on storage.objects for delete using (bucket_id = 'gallery'  and auth.role() = 'authenticated');

-- Seed: Categories
insert into categories (name, slug) values
  ('Men',   'men'),
  ('Women', 'women'),
  ('Kids',  'kids');

-- Seed: Subcategories
insert into subcategories (category_id, name, slug)
select id, 'Sneakers', 'sneakers' from categories where slug = 'men'   union all
select id, 'Formal',   'formal'   from categories where slug = 'men'   union all
select id, 'Sandals',  'sandals'  from categories where slug = 'men'   union all
select id, 'Heels',    'heels'    from categories where slug = 'women' union all
select id, 'Flats',    'flats'    from categories where slug = 'women' union all
select id, 'Sneakers', 'sneakers' from categories where slug = 'women' union all
select id, 'School Shoes', 'school-shoes' from categories where slug = 'kids' union all
select id, 'Sandals',  'sandals'  from categories where slug = 'kids';

-- Seed: Sizes
insert into sizes (label, sort_order) values
  ('UK 4', 1), ('UK 5', 2), ('UK 6', 3),  ('UK 7',  4),
  ('UK 8', 5), ('UK 9', 6), ('UK 10', 7), ('UK 11', 8),
  ('EU 36', 9),  ('EU 37', 10), ('EU 38', 11), ('EU 39', 12),
  ('EU 40', 13), ('EU 41', 14), ('EU 42', 15), ('EU 43', 16);
```

---

## 🧭 Pages & Routes

| Route | Page | Description |
|---|---|---|
| `/` | Home | Carousel, featured products, categories, CTA |
| `/products` | Products | Grid with search, filter, sort |
| `/products/:id` | Product Detail | Images, sizes, add to cart |
| `/gallery` | Gallery | 2-col image grid with lightbox |
| `/about` | About | Store info and values |
| `/contact` | Contact | Phone, map embed |
| `/cart` | Cart | Items, quantities, order summary |
| `/checkout` | Checkout | Customer details form, COD |
| `/order-success` | Order Success | Confirmation screen |
| `/admin/login` | Admin Login | Email + password sign-in |
| `/admin` | Dashboard | Stats: products, banners, orders |
| `/admin/products` | Products | Add / edit / delete products |
| `/admin/banners` | Banners | Upload / delete homepage banners |
| `/admin/gallery` | Gallery | Upload / delete gallery images |
| `/admin/orders` | Orders | View orders, update status |
| `/admin/sizes-subcategories` | Sizes & Types | Manage sizes and subcategories |

---

## 🛒 Order Flow
```
Browse Products
    ↓
Product Detail  (select size + quantity)
    ↓
Add to Cart  (persisted in localStorage)
    ↓
Cart Page  (review items, update quantities)
    ↓
Checkout  (enter name, phone, address)
    ↓
Place Order  (saved to Supabase orders table)
    ↓
Order Success  (confirmation screen)
    ↓
Admin Dashboard  (team sees order, calls customer)
    ↓
Cash on Delivery  (customer pays on arrival)
```

---

## 🔍 Search Features

- **Search overlay** — opens from navbar search icon
- **Debounced** — 300ms delay, searches as you type
- **Searches** name and description fields
- **Text highlighting** — matching text highlighted in results
- **Recent searches** — saved to localStorage
- **Trending tags** — quick-tap popular searches
- **URL sync** — search term lives in `?search=` param (shareable)
- **Inline search** — also available directly on the Products page

---

## 🏷️ Product Filters & Sort

| Filter | Options |
|---|---|
| Category | Men / Women / Kids |
| Subcategory | Sneakers, Formal, Heels, etc. (dynamic) |
| Size | UK 4–11, EU 36–43 (dynamic) |
| Sort | Newest First / Price: Low to High / Price: High to Low |

---

## 🔐 Admin Panel

The admin panel lives at `/admin` and is protected by Supabase Auth.

| Section | What you can do |
|---|---|
| Dashboard | View totals for products, banners, gallery, orders |
| Products | Add, edit, delete products. Upload images. Set featured/active |
| Banners | Upload carousel banners for the homepage |
| Gallery | Upload store/product gallery images |
| Orders | View all orders with customer details. Update order status |
| Sizes & Types | Add/delete sizes and subcategories dynamically |

**Order statuses:** `pending → confirmed → shipped → delivered → cancelled`

---

## 🖼️ Storage Buckets

| Bucket | Used for |
|---|---|
| `products` | Product images |
| `banners` | Homepage carousel banners |
| `gallery` | Store gallery images |

All buckets are **public read** so images load without authentication.
Upload and delete require an authenticated admin session.

---

## 📦 NPM Scripts
```bash
npm run dev      # Start development server (localhost:5173)
npm run build    # Build for production
npm run preview  # Preview production build locally
npm run lint     # Run ESLint
```

---

## 🌍 Deployment

### Vercel (recommended)
```bash
npm install -g vercel
vercel
```

Set your environment variables in the Vercel dashboard under
**Project → Settings → Environment Variables**.

### Netlify
```bash
npm run build
# drag and drop the dist/ folder to netlify.com/drop
```

Or connect your GitHub repo and set build command to `npm run build`
and publish directory to `dist`.

> ⚠️ For both platforms, add all four `VITE_` environment variables
> in the dashboard — they are not read from your local `.env` file.

---

## 🔧 Environment Variables Reference

| Variable | Description | Example |
|---|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL | `https://abc.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key | `eyJhbGci...` |
| `VITE_WHATSAPP_NUMBER` | WhatsApp number with country code | `94771234567` |
| `VITE_STORE_NAME` | Store display name | `Highpoint Shoes` |

---

## 📄 .env.example

Create this file in your project root so others know what to fill in:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
VITE_WHATSAPP_NUMBER=94XXXXXXXXX
VITE_STORE_NAME=Highpoint Shoes
```

---

## 📝 License

MIT License — free to use, modify, and distribute.

---

## 👤 Author

Built with ❤️ for **Highpoint Shoes**
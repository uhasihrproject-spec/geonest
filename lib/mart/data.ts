import type { BlogCard, Category, Product, Testimonial } from "./types";

export const CATEGORIES = [
  { slug: "groceries", name: "Groceries" },
  { slug: "phones", name: "Phones" },
  { slug: "laptops", name: "Laptops" },
  { slug: "electronics", name: "Electronics" },
  { slug: "fashion", name: "Fashion" },
  { slug: "beauty", name: "Beauty" },
  { slug: "home", name: "Home & Living" },
];

export const FEATURED_PRODUCTS: Product[] = [
  { id: "p1", name: "Wireless Earbuds Pro", priceGHS: 399, categorySlug: "electronics" },
  { id: "p2", name: "Smartphone Aura 5G", priceGHS: 3200, categorySlug: "phones" },
  { id: "p3", name: "Sleek Laptop 14”", priceGHS: 6900, categorySlug: "laptops" },
  { id: "p4", name: "Minimal Chair", priceGHS: 1250, categorySlug: "home" },
];

export const TESTIMONIALS = [
  {
    name: "Ama Mensah",
    role: "Accra",
    quote:
      "The assistant helped me pick a phone within my budget fast. The site feels clean and not stressful to use.",
  },
  {
    name: "Kojo Boateng",
    role: "Kumasi",
    quote:
      "I like how everything is simple. I found what I wanted quickly and the layout is smooth on mobile too.",
  },
  {
    name: "Esi Owusu",
    role: "Tema",
    quote:
      "The deals section is actually useful. I didn’t have to scroll forever to find something good.",
  },
  {
    name: "Yaw Adjei",
    role: "Cape Coast",
    quote:
      "The categories sidebar makes sense. It feels like a real online shop, not a school project.",
  },
  {
    name: "Abena Serwaa",
    role: "Takoradi",
    quote:
      "Nice design. The product cards are clean and the checkout flow looks like it will be easy.",
  },
];


export const BLOG_POSTS = [
  {
    id: "1",
    title: "How to shop smart with the Mart Assistant",
    desc: "Use budget prompts to get faster recommendations and avoid stress.",
    date: "This week",
    tag: "Guide",
    cover: "/mart/blog/b1.jpg",
  },
  {
    id: "2",
    title: "Top weekly deals you should not miss",
    desc: "A quick list of trending discounts across groceries, gadgets and beauty.",
    date: "This week",
    tag: "Deals",
    cover: "/mart/blog/b2.jpg",
  },
  {
    id: "3",
    title: "Phones in Ghana: how to choose the best value",
    desc: "What to check before buying — storage, battery, warranty and price.",
    date: "New",
    tag: "Phones",
    cover: "/mart/blog/b3.jpg",
  },
  {
    id: "4",
    title: "Clean home essentials that make life easier",
    desc: "Simple picks for kitchen, bedroom and living space upgrades.",
    date: "New",
    tag: "Home",
    cover: "/mart/blog/b4.jpg",
  },
];

export type MartProduct = {
  id: string;
  name: string;
  priceGHS: number;
  category: "groceries" | "phones" | "laptops" | "electronics" | "fashion" | "beauty" | "home";
  image?: string; // path in /public
  badge?: "New" | "Trending" | "Deal";
};

export const PRODUCTS: MartProduct[] = [
  { id: "p1", name: "Groceries Starter Pack", priceGHS: 149, category: "groceries", image: "/mart/products/p1.jpg", badge: "Deal" },
  { id: "p2", name: "Wireless Earbuds Pro", priceGHS: 399, category: "electronics", image: "/mart/products/p2.jpg", badge: "Trending" },
  { id: "p3", name: "Budget Smartphone (128GB)", priceGHS: 2100, category: "phones", image: "/mart/products/p3.jpg", badge: "New" },
  { id: "p4", name: "Student Laptop (16GB RAM)", priceGHS: 5200, category: "laptops", image: "/mart/products/p4.jpg", badge: "Trending" },
  { id: "p5", name: "Skin Care Kit", priceGHS: 220, category: "beauty", image: "/mart/products/p5.jpg" },
  { id: "p6", name: "Minimal Home Decor Set", priceGHS: 340, category: "home", image: "/mart/products/p6.jpg" },
  { id: "p7", name: "Fashion Essentials Set", priceGHS: 180, category: "fashion", image: "/mart/products/p7.jpg" },
  { id: "p8", name: "Bluetooth Speaker", priceGHS: 450, category: "electronics", image: "/mart/products/p8.jpg", badge: "Deal" },
  { id: "p9", name: "Smart Watch Series X", priceGHS: 850, category: "electronics", image: "/mart/products/p9.jpg", badge: "New" },
  { id: "p10", name: "Power Bank 20000mAh", priceGHS: 280, category: "electronics", image: "/mart/products/p10.jpg", badge: "Deal" },
  { id: "p11", name: "Wireless Mouse", priceGHS: 120, category: "electronics", image: "/mart/products/p11.jpg" },
  { id: "p12", name: "Mechanical Keyboard", priceGHS: 650, category: "electronics", image: "/mart/products/p12.jpg", badge: "Trending" },
  { id: "p13", name: "Android Phone (64GB)", priceGHS: 1350, category: "phones", image: "/mart/products/p13.jpg" },
  { id: "p14", name: "Laptop Sleeve Case", priceGHS: 90, category: "laptops", image: "/mart/products/p14.jpg" },
  { id: "p15", name: "Office Laptop Backpack", priceGHS: 260, category: "fashion", image: "/mart/products/p15.jpg" },
  { id: "p16", name: "Men’s Casual Sneakers", priceGHS: 420, category: "fashion", image: "/mart/products/p16.jpg", badge: "Trending" },
  { id: "p17", name: "Women’s Handbag", priceGHS: 380, category: "fashion", image: "/mart/products/p17.jpg" },

  { id: "p18", name: "LED Desk Lamp", priceGHS: 150, category: "home", image: "/mart/products/p18.jpg" },
  { id: "p19", name: "Non-Stick Cookware Set", priceGHS: 720, category: "home", image: "/mart/products/p19.jpg", badge: "Deal" },
  { id: "p20", name: "Electric Kettle", priceGHS: 230, category: "home", image: "/mart/products/p20.jpg" },

  { id: "p21", name: "Facial Cleansing Kit", priceGHS: 190, category: "beauty", image: "/mart/products/p21.jpg" },
  { id: "p22", name: "Perfume Gift Set", priceGHS: 450, category: "beauty", image: "/mart/products/p22.jpg", badge: "New" },

  { id: "p23", name: "Rice & Essentials Bundle", priceGHS: 320, category: "groceries", image: "/mart/products/p23.jpg" },
  { id: "p24", name: "Weekly Grocery Box", priceGHS: 260, category: "groceries", image: "/mart/products/p24.jpg", badge: "Deal" },
  { id: "p25", name: "Organic Snacks Pack", priceGHS: 180, category: "groceries", image: "/mart/products/p25.jpg" },
  { id: "p26", name: "Portable Fan", priceGHS: 140, category: "home", image: "/mart/products/p26.jpg" },
  { id: "p27", name: "USB-C Fast Charger", priceGHS: 95, category: "electronics", image: "/mart/products/p27.jpg" },
  { id: "p28", name: "Laptop Cooling Pad", priceGHS: 180, category: "electronics", image: "/mart/products/p28.jpg" },
  { id: "p29", name: "Smartphone Car Mount", priceGHS: 60, category: "phones", image: "/mart/products/p29.jpg" },
  { id: "p30", name: "Wireless Charging Pad", priceGHS: 110, category: "electronics", image: "/mart/products/p30.jpg" },
  { id: "p31", name: "Bluetooth Headphones", priceGHS: 320, category: "electronics", image: "/mart/products/p31.jpg", badge: "Trending" },
  { id: "p32", name: "4K Action Camera", priceGHS: 900, category: "electronics", image: "/mart/products/p32.jpg", badge: "New" },
  { id: "p33", name: "Gaming Laptop (32GB RAM)", priceGHS: 8500, category: "laptops", image: "/mart/products/p33.jpg", badge: "New" },
  { id: "p34", name: "Ergonomic Office Chair", priceGHS: 1200, category: "home", image: "/mart/products/p34.jpg" },
  { id: "p35", name: "Smart Home Hub", priceGHS: 650, category: "electronics", image: "/mart/products/p35.jpg", badge: "New" },
  { id: "p36", name: "Fitness Tracker Pro", priceGHS: 400, category: "electronics", image: "/mart/products/p36.jpg", badge: "Trending" },
  { id: "p37", name: "Noise-Cancelling Headphones", priceGHS: 750, category: "electronics", image: "/mart/products/p37.jpg", badge: "New" },
  { id: "p38", name: "Smartphone Gimbal Stabilizer", priceGHS: 300, category: "electronics", image: "/mart/products/p38.jpg" },
  { id: "p39", name: "Laptop Stand Adjustable", priceGHS: 150, category: "laptops", image: "/mart/products/p39.jpg" },
  { id: "p40", name: "Wireless Gaming Mouse", priceGHS: 250, category: "electronics", image: "/mart/products/p40.jpg", badge: "Trending" },
  { id: "p41", name: "Smartphone Screen Protector", priceGHS: 40, category: "phones", image: "/mart/products/p41.jpg" },
  { id: "p42", name: "USB-C Hub Multiport Adapter", priceGHS: 180, category: "electronics", image: "/mart/products/p42.jpg" },
  { id: "p43", name: "Portable SSD 1TB", priceGHS: 600, category: "electronics", image: "/mart/products/p43.jpg", badge: "New" },
  { id: "p44", name: "Wireless Keyboard and Mouse Combo", priceGHS: 350, category: "electronics", image: "/mart/products/p44.jpg" },
  { id: "p45", name: "Smartphone VR Headset", priceGHS: 220, category: "electronics", image: "/mart/products/p45.jpg" },
];


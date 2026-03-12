export type Category = { slug: string; name: string };

export type Product = {
  id: string;
  name: string;
  priceGHS: number;
  categorySlug: string;
  category?: string;
  image?: string;
  badge?: "New" | "Trending" | "Deal";
  tags?: string[];
  description?: string;
};

export type Testimonial = { name: string; role: string; quote: string };

export type BlogCard = { title: string; desc: string };

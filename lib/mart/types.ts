export type Category = { slug: string; name: string };

export type Product = {
  id: string;
  name: string;
  priceGHS: number;
  categorySlug: string;
};

export type Testimonial = { name: string; role: string; quote: string };

export type BlogCard = { title: string; desc: string };

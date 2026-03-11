export async function getFeaturedProducts() {
  const res = await fetch("/api/mart/products");
  if (!res.ok) throw new Error("Failed to load products");
  return res.json() as Promise<{ products: any[] }>;
}

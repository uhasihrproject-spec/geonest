export function recommendProducts(products: any[], budget?: number) {
  if (!products.length) return [];

  return products
    .filter(p => (budget ? p.priceGHS <= budget : true))
    .slice(0, 3)
    .map(p => ({
      name: p.name,
      price: p.priceGHS,
      reason: "Best value for the price"
    }));
}

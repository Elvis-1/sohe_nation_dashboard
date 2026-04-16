import { mockProducts } from "@/src/features/products/data/mock-products";

export function listProducts() {
  return mockProducts;
}

export function listLowStockProducts(threshold = 5) {
  return mockProducts.filter((product) => product.inventoryQuantity <= threshold);
}

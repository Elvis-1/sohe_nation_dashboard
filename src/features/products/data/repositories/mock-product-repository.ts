import { mockProducts } from "@/src/features/products/data/mock-products";

const PRODUCT_STORAGE_KEY = "sohe-dashboard-products";
const PRODUCT_CHANGE_EVENT = "sohe-dashboard-products-change";

let cachedProductsRaw: string | null | undefined;
let cachedProductsValue: typeof mockProducts | undefined;

export function listProducts() {
  return mockProducts;
}

export function listLowStockProducts(threshold = 5) {
  return mockProducts.filter((product) => product.inventoryQuantity <= threshold);
}

export function getProductById(productId: string) {
  return listProducts().find((product) => product.id === productId) ?? null;
}

function cloneProducts() {
  return JSON.parse(JSON.stringify(mockProducts)) as typeof mockProducts;
}

function readStoredProducts() {
  if (typeof window === "undefined") {
    return cloneProducts();
  }

  const rawValue = window.localStorage.getItem(PRODUCT_STORAGE_KEY);

  if (!rawValue) {
    return cloneProducts();
  }

  try {
    const parsedValue = JSON.parse(rawValue) as typeof mockProducts;

    return parsedValue;
  } catch {
    window.localStorage.removeItem(PRODUCT_STORAGE_KEY);
    return cloneProducts();
  }
}

function dispatchProductChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(PRODUCT_CHANGE_EVENT));
  }
}

export function subscribeToStoredProducts(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === PRODUCT_STORAGE_KEY) {
      onStoreChange();
    }
  };

  const handleProductChange = () => {
    onStoreChange();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(PRODUCT_CHANGE_EVENT, handleProductChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(PRODUCT_CHANGE_EVENT, handleProductChange);
  };
}

export function getStoredProductsSnapshot() {
  if (typeof window === "undefined") {
    return listProducts();
  }

  const rawValue = window.localStorage.getItem(PRODUCT_STORAGE_KEY);

  if (rawValue === cachedProductsRaw && cachedProductsValue !== undefined) {
    return cachedProductsValue;
  }

  cachedProductsRaw = rawValue;
  cachedProductsValue = readStoredProducts();

  return cachedProductsValue;
}

export function createProductRecord(nextProduct: (typeof mockProducts)[number]) {
  const currentProducts = readStoredProducts();
  const updatedProducts = [nextProduct, ...currentProducts];

  window.localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(updatedProducts));
  dispatchProductChange();
}

export function updateProductRecord(nextProduct: (typeof mockProducts)[number]) {
  const currentProducts = readStoredProducts();
  const updatedProducts = currentProducts.map((product) =>
    product.id === nextProduct.id ? nextProduct : product,
  );

  window.localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(updatedProducts));
  dispatchProductChange();
}

export function clearStoredProductCatalog() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(PRODUCT_STORAGE_KEY);
  dispatchProductChange();
}

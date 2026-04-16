import { mockOrders } from "@/src/features/orders/data/mock-orders";

const ORDER_STORAGE_KEY = "sohe-dashboard-orders";
const ORDER_CHANGE_EVENT = "sohe-dashboard-orders-change";

let cachedOrdersRaw: string | null | undefined;
let cachedOrdersValue: typeof mockOrders | undefined;

export function listOrders() {
  return mockOrders;
}

export function listRecentOrders(limit = 3) {
  return getStoredOrdersSnapshot().slice(0, limit);
}

export function getOrderById(orderId: string) {
  return getStoredOrdersSnapshot().find((order) => order.id === orderId) ?? null;
}

export function getOrderByOrderNumber(orderNumber: string) {
  return getStoredOrdersSnapshot().find((order) => order.orderNumber === orderNumber) ?? null;
}

function cloneOrders() {
  return JSON.parse(JSON.stringify(mockOrders)) as typeof mockOrders;
}

function readStoredOrders() {
  if (typeof window === "undefined") {
    return cloneOrders();
  }

  const rawValue = window.localStorage.getItem(ORDER_STORAGE_KEY);

  if (!rawValue) {
    return cloneOrders();
  }

  try {
    const parsedValue = JSON.parse(rawValue) as typeof mockOrders;

    return parsedValue;
  } catch {
    window.localStorage.removeItem(ORDER_STORAGE_KEY);
    return cloneOrders();
  }
}

function dispatchOrderChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(ORDER_CHANGE_EVENT));
  }
}

export function subscribeToStoredOrders(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === ORDER_STORAGE_KEY) {
      onStoreChange();
    }
  };

  const handleOrderChange = () => {
    onStoreChange();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(ORDER_CHANGE_EVENT, handleOrderChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(ORDER_CHANGE_EVENT, handleOrderChange);
  };
}

export function getStoredOrdersSnapshot() {
  if (typeof window === "undefined") {
    return listOrders();
  }

  const rawValue = window.localStorage.getItem(ORDER_STORAGE_KEY);

  if (rawValue === cachedOrdersRaw && cachedOrdersValue !== undefined) {
    return cachedOrdersValue;
  }

  cachedOrdersRaw = rawValue;
  cachedOrdersValue = readStoredOrders();

  return cachedOrdersValue;
}

export function updateOrderRecord(nextOrder: (typeof mockOrders)[number]) {
  const currentOrders = readStoredOrders();
  const updatedOrders = currentOrders.map((order) =>
    order.id === nextOrder.id ? nextOrder : order,
  );

  window.localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(updatedOrders));
  dispatchOrderChange();
}

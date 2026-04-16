import type { OverviewSnapshot } from "@/src/core/types/dashboard";
import {
  overviewMetrics,
  overviewModules,
  quickActions,
} from "@/src/features/overview/data/mock-overview";
import { listRecentOrders } from "@/src/features/orders/data/repositories/order-repository";
import { listLowStockProducts } from "@/src/features/products/data/repositories/mock-product-repository";
import { listPendingReturns } from "@/src/features/returns/data/repositories/mock-return-repository";

export function getOverviewSnapshot(): OverviewSnapshot {
  const recentOrders = listRecentOrders();
  const lowStockProducts = listLowStockProducts();
  const returnQueue = listPendingReturns();

  return {
    overviewMetrics,
    overviewModules,
    quickActions,
    recentOrders,
    lowStockProducts,
    returnQueue,
    prioritySummary: {
      activeOrderCount: recentOrders.filter((order) => order.status !== "delivered").length,
      lowStockCount: lowStockProducts.length,
      returnQueueCount: returnQueue.length,
    },
  };
}

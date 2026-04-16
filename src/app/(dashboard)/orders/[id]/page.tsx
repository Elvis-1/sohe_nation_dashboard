import { OrderDetailPageShell } from "@/src/features/orders/presentation/components/order-detail-page-shell";

export default async function OrderDetailPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;

  return <OrderDetailPageShell orderId={id} />;
}

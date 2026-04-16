import { CustomerDetailPageShell } from "@/src/features/customers/presentation/components/customer-detail-page-shell";

export default async function CustomerDetailPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;

  return <CustomerDetailPageShell customerId={id} />;
}

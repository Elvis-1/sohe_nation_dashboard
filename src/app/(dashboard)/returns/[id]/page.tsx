import { ReturnDetailPageShell } from "@/src/features/returns/presentation/components/return-detail-page-shell";

export default async function ReturnDetailPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;

  return <ReturnDetailPageShell returnId={id} />;
}

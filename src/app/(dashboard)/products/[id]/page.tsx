import { ProductEditorPageShell } from "@/src/features/products/presentation/components/product-editor-page-shell";

export default async function ProductDetailPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;

  return <ProductEditorPageShell productId={id} />;
}

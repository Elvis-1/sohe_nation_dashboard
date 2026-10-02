import { InfoPageEditorShell } from "@/src/features/content/presentation/components/info-page-editor-shell";

export default async function InfoPageEditorPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;

  return <InfoPageEditorShell contentId={id} />;
}

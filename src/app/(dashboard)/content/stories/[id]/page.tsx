import { StorySeoEditorShell } from "@/src/features/content/presentation/components/story-seo-editor-shell";

export default async function StorySeoEditorPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;

  return <StorySeoEditorShell contentId={id} />;
}

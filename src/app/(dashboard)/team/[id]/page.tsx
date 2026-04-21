import { TeamDetailPageShell } from "@/src/features/staff/presentation/components/team-detail-page-shell";

export default async function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TeamDetailPageShell memberId={id} />;
}

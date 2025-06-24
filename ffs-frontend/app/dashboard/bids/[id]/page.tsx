import BidDetails from '@/components/bid/BidDetails';

export default async function BidDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <BidDetails id={id} />;
}

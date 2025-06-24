import DistrictDetails from '@/components/district/DistrictDetails';

export default async function DistrictDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DistrictDetails id={id} />;
}

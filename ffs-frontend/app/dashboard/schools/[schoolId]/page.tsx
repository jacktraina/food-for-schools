import SchoolPageContent from '@/components/school/SchoolDetails';

export default async function SchoolPage({
  params,
}: {
  params: Promise<{ schoolId: string }>;
}) {
  const { schoolId } = await params;

  return <SchoolPageContent schoolId={schoolId} />;
}

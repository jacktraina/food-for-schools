export function generateCsvTemplate(headers: string[]): string {
  return headers.join(',') + '\n';
}

export function generateBulkUserTemplate(): string {
  const headers = ['email', 'full_name', 'role', 'bid_role', 'district_id', 'school_id'];
  return generateCsvTemplate(headers);
}

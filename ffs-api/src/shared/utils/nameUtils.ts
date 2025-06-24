export function getInitials(
  firstName: string,
  middleName: string | null,
  lastName: string
): string {
  const firstInitial = firstName.trim() ? firstName.trim()[0] : '';
  const middleInitial = middleName?.trim() ? middleName.trim()[0] : '';
  const lastInitial = lastName.trim() ? lastName.trim()[0] : '';
  console.log('reutrning initial s' + `${firstInitial}${middleInitial}${lastInitial}`);
  return `${firstInitial}${middleInitial}${lastInitial}`;
}
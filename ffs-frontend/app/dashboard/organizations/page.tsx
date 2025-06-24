import { redirect } from "next/navigation"

export default function OrganizationsPage() {
  // Redirect to districts page as that's the first item in the organizations menu
  redirect("/dashboard/districts")
}

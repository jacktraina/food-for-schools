export interface CommitteeMember {
  id: string
  userId?: string
  name: string
  district: string
  email: string
  phone: string
  bidId: string
}

export const mockCommitteeMembers: CommitteeMember[] = [
  {
    id: "cm-1",
    userId: "user-1",
    name: "Debbi Ascher",
    district: "BOCES-West Suffolk",
    email: "dascher@wsboces.org",
    phone: "(631) 425-9041 x357",
    bidId: "BID-2023-001",
  },
  {
    id: "cm-2",
    userId: "user-1",
    name: "Carly Prusher",
    district: "Glen Cove School District",
    email: "cprusher@glencoveschools.org",
    phone: "(516) 801-7094",
    bidId: "BID-2023-001",
  },
  {
    id: "cm-3",
    userId: "user-1",
    name: "Deborah Rhodes",
    district: "Comsewogue UFSD",
    email: "drhodes@comsewogue.k12.ny.us",
    phone: "(631) 474-2848",
    bidId: "BID-2023-001",
  },
  {
    id: "cm-4",
    userId: "user-1",
    name: "Danielle Teicher",
    district: "Northport/E. Northport",
    email: "danielle.teicher@northport.k12.ny.us",
    phone: "(631) 262-6648",
    bidId: "BID-2023-001",
  },
  {
    id: "cm-5",
    userId: "user-1",
    name: "John Smith",
    district: "Smithtown CSD",
    email: "jsmith@smithtown.k12.ny.us",
    phone: "(631) 382-2000",
    bidId: "BID-2023-002",
  },
  {
    id: "cm-6",
    userId: "user-1",
    name: "Sarah Johnson",
    district: "Huntington UFSD",
    email: "sjohnson@huntington.k12.ny.us",
    phone: "(631) 673-2000",
    bidId: "BID-2023-002",
  },
  {
    id: "cm-7",
    userId: "user-1",
    name: "Michael Brown",
    district: "Syosset CSD",
    email: "mbrown@syosset.k12.ny.us",
    phone: "(516) 364-5600",
    bidId: "BID-2023-003",
  },
  {
    id: "cm-8",
    userId: "user-1",
    name: "Jennifer Davis",
    district: "Plainview-Old Bethpage CSD",
    email: "jdavis@pobschools.org",
    phone: "(516) 434-3000",
    bidId: "BID-2023-003",
  },
  {
    id: "cm-9",
    userId: "user-1",
    name: "Robert Wilson",
    district: "Half Hollow Hills CSD",
    email: "rwilson@hhh.k12.ny.us",
    phone: "(631) 592-3000",
    bidId: "BID-2023-004",
  },
  {
    id: "cm-10",
    userId: "user-1",
    name: "Lisa Martinez",
    district: "Commack UFSD",
    email: "lmartinez@commack.k12.ny.us",
    phone: "(631) 912-2000",
    bidId: "BID-2023-004",
  },
]

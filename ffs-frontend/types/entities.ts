// First, add the SchoolType enum at the top of the file, before the interfaces
export type SchoolType =
  | 'High School'
  | 'Middle School'
  | 'Elementary School'
  | 'Childcare';

// Mock data for districts, schools, and other entities

export interface District {
  id: number;
  name: string;
  coopId?: string; // Make coopId optional
  isInCoop: boolean; // Add new boolean field to indicate coop membership
  location?: string;
  directorName?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  fax?: string;
  email?: string;
  website?: string;
  logo?: string;
  description?: string;
  enrollment?: number;
  raNumber?: string;
  contact2?: string;
  contact2Phone?: string;
  contact2Email?: string;
  billingContactFirstName?: string;
  billingContactLastName?: string;
  billingPhone?: string;
  billingEmail?: string;
  billingAddress?: string;
  superintendent?: string;
  established?: string;
  status?: string;
  budget?: string;
  lastUpdated?: string;
  participatingIn?: string[];
  schools?: School[]; // Add schools array to District
}

// Update the School interface to include fax
export interface School {
  id: string;
  name: string;
  districtId: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  enrollment: number; // Change from string to number
  phone?: string;
  fax?: string; // Add fax field
  email?: string;
  website?: string;
  logo?: string;
  description?: string;
  type?: SchoolType;
  billingContactFirstName?: string;
  billingContactLastName?: string;
  billingAddress?: string;
  billingPhone?: string;
  billingEmail?: string;
  status?: string;
  schoolContact?: string;
  primaryContactFirstName?: string;
  primaryContactLastName?: string;
  primaryContactTitle?: string;
  primaryContactPhone?: string;
  primaryContactEmail?: string;
  shippingAddress?: string;
  notes?: string;
}

// Add a Cooperative interface
export interface Cooperative {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  description?: string;
  billingContactFirstName?: string;
  billingContactLastName?: string;
  billingAddress?: string;
  billingPhone?: string;
  billingEmail?: string;
}

export const mockDistricts: District[] = [
  {
    id: 1,
    name: 'Springfield School District',
    coopId: 'coop-1',
    isInCoop: true,
    address: '123 Main St',
    city: 'Centralville',
    state: 'CA',
    zip: '90001',
    phone: '(555) 123-4567',
    fax: '(555) 123-4568',
    email: 'info@centralsd.edu',
    website: 'https://www.centralsd.edu',
    logo: null,
    description:
      'Central School District serves the Centralville area with a focus on academic excellence and community engagement.',
    billingContactFirstName: 'Sarah',
    billingContactLastName: 'Williams',
    billingAddress: '456 Finance Blvd, Centralville, CA 90001',
    billingPhone: '(555) 123-4570',
    billingEmail: 'billing@centralsd.edu',
    location: 'Centralville, CA',
    directorName: 'Dr. Jane Smith',
    enrollment: 8200,
    raNumber: 'RA-2023-0001',
    contact2: 'Michael Johnson',
    contact2Phone: '(555) 123-4569',
    contact2Email: 'mjohnson@centralsd.edu',
    superintendent: 'Dr. Robert Anderson',
    established: '1970',
    status: 'Active',
    budget: '$42,000,000',
    lastUpdated: 'April 1, 2024',
    participatingIn: ['Bagel', 'Dairy', 'Office Supplies', 'Technology'],
  },
  {
    id: 2,
    name: 'Eastside School District',
    coopId: 'coop-1',
    isInCoop: true,
    address: '456 Oak Ave',
    city: 'Eastville',
    state: 'CA',
    zip: '90002',
    phone: '(555) 234-5678',
    fax: '(555) 234-5679',
    email: 'info@eastsidesd.edu',
    website: 'https://www.eastsidesd.edu',
    logo: null,
    description:
      'Eastside School District is committed to providing quality education to all students in the Eastville community.',
    billingContactFirstName: 'Rachel',
    billingContactLastName: 'Kim',
    billingAddress: '789 Budget Lane, Eastville, CA 90002',
    billingPhone: '(555) 234-5680',
    billingEmail: 'billing@eastsidesd.edu',
    location: 'Eastville, CA',
    directorName: 'Dr. Marcus Lee',
    enrollment: 9400,
    raNumber: 'RA-2023-0002',
    contact2: 'Lisa Chen',
    contact2Phone: '(555) 234-5670',
    contact2Email: 'lchen@eastsidesd.edu',
    superintendent: 'Dr. Maria Gonzalez',
    established: '1962',
    status: 'Active',
    budget: '$48,500,000',
    lastUpdated: 'March 20, 2024',
    participatingIn: [
      'Bread',
      'Fresh Produce',
      'Frozen Foods',
      'Paper Products',
    ],
  },
  {
    id: 3,
    name: 'Westside School District',
    coopId: 'coop-2',
    isInCoop: true,
    address: '789 Pine St',
    city: 'Westville',
    state: 'CA',
    zip: '90003',
    phone: '(555) 345-6789',
    fax: '(555) 345-6790',
    email: 'info@westsidesd.edu',
    website: 'https://www.westsidesd.edu',
    logo: null,
    description:
      'Westside School District focuses on innovative teaching methods and student-centered learning.',
    billingContactFirstName: 'Tom',
    billingContactLastName: 'Baker',
    billingAddress: '321 Ledger Way, Westville, CA 90003',
    billingPhone: '(555) 345-6791',
    billingEmail: 'billing@westsidesd.edu',
    location: 'Westville, CA',
    directorName: 'Dr. Angela Park',
    enrollment: 7600,
    raNumber: 'RA-2023-0003',
    contact2: 'Jamal Rivers',
    contact2Phone: '(555) 345-6780',
    contact2Email: 'jrivers@westsidesd.edu',
    superintendent: 'Dr. Harold Bennett',
    established: '1981',
    status: 'Active',
    budget: '$39,700,000',
    lastUpdated: 'February 10, 2024',
    participatingIn: ['Desks', 'Dairy', 'Technology', 'Paper Products'],
  },
  {
    id: 4,
    name: 'Southside School District',
    coopId: 'coop-2',
    isInCoop: true,
    address: '101 Maple Dr',
    city: 'Southtown',
    state: 'CA',
    zip: '90004',
    phone: '(555) 456-7890',
    fax: '(555) 456-7891',
    email: 'info@southsidesd.edu',
    website: 'https://www.southsidesd.edu',
    logo: null,
    description:
      'Southside School District prioritizes inclusive education and holistic student development.',
    billingContactFirstName: 'Natalie',
    billingContactLastName: 'Brooks',
    billingAddress: '202 Ledger Ct, Southtown, CA 90004',
    billingPhone: '(555) 456-7892',
    billingEmail: 'billing@southsidesd.edu',
    location: 'Southtown, CA',
    directorName: 'Dr. Kevin Turner',
    enrollment: 8900,
    raNumber: 'RA-2023-0004',
    contact2: 'Amanda Reyes',
    contact2Phone: '(555) 456-7893',
    contact2Email: 'areyes@southsidesd.edu',
    superintendent: 'Dr. Michelle Carter',
    established: '1975',
    status: 'Active',
    budget: '$43,800,000',
    lastUpdated: 'April 10, 2024',
    participatingIn: ['Bagel', 'Fresh Produce', 'Frozen Foods', 'Technology'],
  },
  // Add an example of a district that's not in a cooperative
  {
    id: 5,
    name: 'Independent School District',
    isInCoop: false,
    address: '505 Independence Ave',
    city: 'Liberty',
    state: 'CA',
    zip: '90005',
    phone: '(555) 567-8901',
    fax: '(555) 567-8902',
    email: 'info@independentsd.edu',
    website: 'https://www.independentsd.edu',
    logo: null,
    description:
      'Independent School District operates autonomously to serve the educational needs of the Liberty community.',
    billingContactFirstName: 'James',
    billingContactLastName: 'Wilson',
    billingAddress: '505 Independence Ave, Liberty, CA 90005',
    billingPhone: '(555) 567-8903',
    billingEmail: 'billing@independentsd.edu',
    location: 'Liberty, CA',
    directorName: 'Dr. Elizabeth Taylor',
    enrollment: 6500,
    raNumber: 'RA-2023-0005',
    contact2: 'Robert Johnson',
    contact2Phone: '(555) 567-8904',
    contact2Email: 'rjohnson@independentsd.edu',
    superintendent: 'Dr. William Davis',
    established: '1985',
    status: 'Active',
    budget: '$35,200,000',
    lastUpdated: 'April 15, 2024',
    participatingIn: ['Bread', 'Dairy', 'Office Supplies', 'Technology'],
  },
];

// Update the mockSchools array to include fax numbers
export const mockSchools: School[] = [
  {
    id: 'school-101',
    name: 'Springfield Elementary School',
    districtId: 1,
    address: '100 High School Rd',
    city: 'Centralville',
    state: 'CA',
    enrollment: 1733,
    zip: '90001',
    phone: '(555) 111-2222',
    fax: '(555) 111-2223', // Add fax number
    email: 'info@springfieldelementary.edu',
    website: 'https://www.springfieldelementary.edu',
    type: 'Elementary School',
    billingContactFirstName: 'Sarah',
    billingContactLastName: 'Sullivan',
    billingAddress: '456 Finance Blvd, Springfield, IL 62701',
    billingPhone: '(555) 123-4570',
    billingEmail: 'billing@springfieldschools.edu',
    description:
      'Springfield Elementary School offers a comprehensive curriculum with a focus on innovative teaching methods and student-centered learning.',
    status: 'Active',
    schoolContact:
      'Lisa Johnson - (555) 111-2222 - info@springfieldelementary.edu',
    primaryContactFirstName: 'Lisa',
    primaryContactLastName: 'Johnson',
    primaryContactTitle: 'Principal',
    primaryContactPhone: '(555) 111-2223',
    primaryContactEmail: 'ljohnson@springfieldelementary.edu',
    shippingAddress: '100 High School Rd, Centralville, CA 90001',
    notes:
      'Elementary School in the district. Springfield Elementary School offers a comprehensive curriculum with a focus on innovative teaching methods and student-centered learning.',
  },
  {
    id: 'school-102',
    name: 'Central Middle School',
    districtId: 1,
    address: '200 Middle School Rd',
    city: 'Centralville',
    state: 'CA',
    zip: '90001',
    enrollment: 1245,
    phone: '(555) 222-3333',
    fax: '(555) 222-3334', // Add fax number
    email: 'info@centralmiddle.edu',
    website: 'https://www.centralmiddle.edu',
    type: 'Middle School',
    billingContactFirstName: 'Michael',
    billingContactLastName: 'Thompson',
    billingAddress: '200 Middle School Rd, Centralville, CA 90001',
    billingPhone: '(555) 222-3334',
    billingEmail: 'billing@centralmiddle.edu',
    description:
      'Central Middle School provides a supportive environment for students transitioning from elementary to high school.',
    status: 'Active',
    schoolContact: 'John Smith - (555) 222-3333 - info@centralmiddle.edu',
    primaryContactFirstName: 'John',
    primaryContactLastName: 'Smith',
    primaryContactTitle: 'Principal',
    primaryContactPhone: '(555) 222-3335',
    primaryContactEmail: 'jsmith@centralmiddle.edu',
    shippingAddress: '200 Middle School Rd, Centralville, CA 90001',
    notes:
      'Middle School in the district. Central Middle School provides a supportive environment for students transitioning from elementary to high school.',
  },
  {
    id: 'school-103',
    name: 'Central Elementary School',
    districtId: 1,
    address: '300 Elementary School Rd',
    city: 'Centralville',
    state: 'CA',
    zip: '90001',
    enrollment: 982,
    phone: '(555) 333-4444',
    fax: '(555) 333-4445', // Add fax number
    email: 'info@centralelementary.edu',
    type: 'Elementary School',
    website: 'https://www.centralelementary.edu',
    billingContactFirstName: 'Jennifer',
    billingContactLastName: 'Davis',
    billingAddress: '300 Elementary School Rd, Centralville, CA 90001',
    billingPhone: '(555) 333-4445',
    billingEmail: 'billing@centralelementary.edu',
    description:
      'Central Elementary School focuses on building a strong foundation for lifelong learning.',
    status: 'Active',
    schoolContact: 'Maria Garcia - (555) 333-4444 - info@centralelementary.edu',
    primaryContactFirstName: 'Maria',
    primaryContactLastName: 'Garcia',
    primaryContactTitle: 'Principal',
    primaryContactPhone: '(555) 333-4446',
    primaryContactEmail: 'mgarcia@centralelementary.edu',
    shippingAddress: '300 Elementary School Rd, Centralville, CA 90001',
    notes:
      'Elementary School in the district. Central Elementary School focuses on building a strong foundation for lifelong learning.',
  },
  {
    id: 'school-201',
    name: 'Eastside High School',
    districtId: 2,
    address: '400 High School Ave',
    city: 'Eastville',
    state: 'CA',
    zip: '90002',
    enrollment: 2150,
    phone: '(555) 444-5555',
    fax: '(555) 444-5556', // Add fax number
    email: 'info@eastsidehigh.edu',
    website: 'https://www.eastsidehigh.edu',
    type: 'High School',
    billingContactFirstName: 'Robert',
    billingContactLastName: 'Wilson',
    billingAddress: '400 High School Ave, Eastville, CA 90002',
    billingPhone: '(555) 444-5556',
    billingEmail: 'billing@eastsidehigh.edu',
    description:
      'Eastside High School is known for its strong STEM program and extracurricular activities.',
    status: 'Active',
    schoolContact: 'David Thompson - (555) 444-5555 - info@eastsidehigh.edu',
    primaryContactFirstName: 'David',
    primaryContactLastName: 'Thompson',
    primaryContactTitle: 'Principal',
    primaryContactPhone: '(555) 444-5557',
    primaryContactEmail: 'dthompson@eastsidehigh.edu',
    shippingAddress: '400 High School Ave, Eastville, CA 90002',
    notes:
      'High School in the district. Eastside High School is known for its strong STEM program and extracurricular activities.',
  },
  {
    id: 'school-301',
    name: 'Westside High School',
    districtId: 3,
    address: '500 High School Blvd',
    city: 'Westville',
    state: 'CA',
    zip: '90003',
    enrollment: 1875,
    phone: '(555) 555-6666',
    fax: '(555) 555-6667', // Add fax number
    email: 'info@westsidehigh.edu',
    type: 'High School',
    website: 'https://www.westsidehigh.edu',
    billingContactFirstName: 'Patricia',
    billingContactLastName: 'Brown',
    billingAddress: '500 High School Blvd, Westville, CA 90003',
    billingPhone: '(555) 555-6667',
    billingEmail: 'billing@westsidehigh.edu',
    description:
      'Westside High School emphasizes arts education alongside traditional academic subjects.',
    status: 'Active',
    schoolContact: 'Sarah Wilson - (555) 555-6666 - info@westsidehigh.edu',
    primaryContactFirstName: 'Sarah',
    primaryContactLastName: 'Wilson',
    primaryContactTitle: 'Principal',
    primaryContactPhone: '(555) 555-6668',
    primaryContactEmail: 'swilson@westsidehigh.edu',
    shippingAddress: '500 High School Blvd, Westville, CA 90003',
    notes:
      'High School in the district. Westside High School emphasizes arts education alongside traditional academic subjects.',
  },
  {
    id: 'school-401',
    name: 'Southside Middle School',
    districtId: 4,
    address: '250 Middle School Ln',
    city: 'Southville',
    state: 'CA',
    zip: '90004',
    enrollment: 1050,
    phone: '(555) 555-7777',
    fax: '(555) 555-7778', // Add fax number
    email: 'contact@southsidemiddle.edu',
    type: 'Middle School',
    website: 'https://www.southsidemiddle.edu',
    billingContactFirstName: 'James',
    billingContactLastName: 'Anderson',
    billingAddress: '250 Middle School Ln, Southville, CA 90004',
    billingPhone: '(555) 555-7778',
    billingEmail: 'billing@southsidemiddle.edu',
    description:
      'Southside Middle School fosters a supportive learning environment focused on student growth and community engagement.',
    status: 'Active',
    schoolContact: 'John Garcia - (555) 555-7777 - contact@southsidemiddle.edu',
    primaryContactFirstName: 'John',
    primaryContactLastName: 'Garcia',
    primaryContactTitle: 'Principal',
    primaryContactPhone: '(555) 555-7779',
    primaryContactEmail: 'jgarcia@southsidemiddle.edu',
    shippingAddress: '250 Middle School Ln, Southville, CA 90004',
    notes:
      'Middle School in the district. Southside Middle School fosters a supportive learning environment focused on student growth and community engagement.',
  },
  {
    id: 'school-501',
    name: 'Independent Elementary School',
    districtId: 5,
    address: '600 Elementary Ave',
    city: 'Liberty',
    state: 'CA',
    zip: '90005',
    enrollment: 825,
    phone: '(555) 666-8888',
    fax: '(555) 666-8889', // Add fax number
    email: 'info@independentelementary.edu',
    type: 'Elementary School',
    website: 'https://www.independentelementary.edu',
    billingContactFirstName: 'Elizabeth',
    billingContactLastName: 'Taylor',
    billingAddress: '600 Elementary Ave, Liberty, CA 90005',
    billingPhone: '(555) 666-8889',
    billingEmail: 'billing@independentelementary.edu',
    description:
      'Independent Elementary School focuses on personalized learning and small class sizes.',
    status: 'Active',
    schoolContact:
      'Maria Thompson - (555) 666-8888 - info@independentelementary.edu',
    primaryContactFirstName: 'Maria',
    primaryContactLastName: 'Thompson',
    primaryContactTitle: 'Principal',
    primaryContactPhone: '(555) 666-8890',
    primaryContactEmail: 'mthompson@independentelementary.edu',
    shippingAddress: '600 Elementary Ave, Liberty, CA 90005',
    notes:
      'Elementary School in the district. Independent Elementary School focuses on personalized learning and small class sizes.',
  },
];

// After the mockSchools and mockDistricts declarations, add this code to establish the relationships

// Update mockDistricts to include schools
export const mockDistrictsWithSchools = mockDistricts.map((district) => {
  // Find all schools that belong to this district
  const districtSchools = mockSchools.filter(
    (school) => school.districtId === district.id
  );

  // Return the district with its schools
  return {
    ...district,
    schools: districtSchools,
  };
});

// Replace the original mockDistricts with the updated version;

// Add some sample cooperative data
export const mockCooperatives: Cooperative[] = [
  {
    id: 'coop-1',
    name: 'Food For Schools Cooperative',
    address: '789 Cooperative Way',
    city: 'Central City',
    state: 'IL',
    zip: '62701',
    phone: '(555) 987-6543',
    email: 'info@foodforschools.org',
    website: 'https://www.foodforschools.org',
    logo: '/images/food-for-schools-logo.png',
    description:
      'A cooperative dedicated to providing quality food services to schools across the region.',
    billingContactFirstName: 'John',
    billingContactLastName: 'Doe',
    billingAddress: '789 Cooperative Way, Central City, IL 62701',
    billingPhone: '(555) 987-6543',
    billingEmail: 'billing@foodforschools.org',
  },
  {
    id: 'coop-2',
    name: 'Educational Resources Cooperative',
    address: '456 Education Blvd',
    city: 'Learning City',
    state: 'IL',
    zip: '62702',
    phone: '(555) 456-7890',
    email: 'info@edresources.org',
    website: 'https://www.edresources.org',
    logo: '/images/ed-resources-logo.png',
    description:
      'Providing educational resources and services to schools and districts.',
    billingContactFirstName: 'Jane',
    billingContactLastName: 'Smith',
    billingAddress: '456 Education Blvd, Learning City, IL 62702',
    billingPhone: '(555) 456-7890',
    billingEmail: 'billing@edresources.org',
  },
];

// Sample bid data with updated properties - bid names now match categories
export const mockBids = [
  {
    id: 1,
    name: 'Produce', // Changed from "Fresh Produce Supply" to match category
    note: 'Annual bid for fresh fruits and vegetables',
    bidYear: '2023-2024',
    category: 'CAT-008', // Produce
    status: 'Released',
    awardType: 'Line Item',
    startDate: new Date('2023-05-01'),
    endDate: new Date('2024-04-30'),
    anticipatedOpeningDate: new Date('2023-06-15T10:00:00'),
    awardDate: new Date('2023-06-30'),
    bidManagerId: '1', // John Smith
    description:
      'Seeking suppliers for fresh fruits and vegetables for the 2023-2024 school year.',
    estimatedValue: '$250,000',
    organizationId: 'coop-456', // Central State Cooperative
    organizationType: 'co-op' as const,
  },
  {
    id: 2,
    name: 'Dairy', // Changed from "Dairy Products Supply" to match category
    note: 'Milk, cheese, and yogurt for all schools',
    bidYear: '2023-2024',
    category: 'CAT-003', // Dairy
    status: 'In Process',
    awardType: 'Bottom Line',
    startDate: new Date('2023-07-01'),
    endDate: new Date('2024-06-30'),
    anticipatedOpeningDate: new Date('2023-07-10T14:00:00'),
    awardDate: null,
    bidManagerId: '2', // Alex Ramirez
    description:
      'Seeking suppliers for dairy products including milk, cheese, and yogurt.',
    estimatedValue: '$175,000',
    organizationId: 'district-123', // Springfield School District
    organizationType: 'district' as const,
  },
  {
    id: 3,
    name: 'Paper', // Changed from "Classroom Technology Equipment" to match category
    note: 'Paper products including napkins, plates, and towels',
    bidYear: '2023-2024',
    category: 'CAT-007', // Paper
    status: 'Opened',
    awardType: 'Market Basket',
    startDate: new Date('2023-03-15'),
    endDate: new Date('2024-03-14'),
    anticipatedOpeningDate: new Date('2023-04-30T09:00:00'),
    awardDate: new Date('2023-05-15'),
    bidManagerId: '3', // Taylor Chen
    description:
      'Seeking suppliers for paper products including napkins, plates, and towels.',
    estimatedValue: '$85,000',
    organizationId: 'district-123', // Springfield School District
    organizationType: 'district' as const,
  },
  {
    id: 4,
    name: 'Cleaning', // Changed from "School Bus Maintenance Services" to match category
    note: 'Cleaning supplies and janitorial products',
    bidYear: '2023-2024',
    category: 'CAT-002', // Cleaning
    status: 'Awarded',
    awardType: 'RFP',
    startDate: new Date('2023-04-20'),
    endDate: new Date('2024-04-19'),
    anticipatedOpeningDate: new Date('2023-06-01T13:30:00'),
    awardDate: null,
    bidManagerId: '3', // Taylor Chen
    description:
      'Seeking qualified vendors for cleaning supplies and janitorial products.',
    estimatedValue: '$120,000',
    organizationId: 'district-123', // Springfield School District
    organizationType: 'district' as const,
  },
  {
    id: 5,
    name: 'Frozen', // Changed from "Cafeteria Furniture Replacement" to match category
    note: 'Frozen food items including vegetables, meats, and prepared meals',
    bidYear: '2023-2024',
    category: 'CAT-004', // Frozen
    status: 'Canceled',
    awardType: 'Item Group',
    startDate: null,
    endDate: null,
    anticipatedOpeningDate: new Date('2023-08-15T11:00:00'),
    awardDate: null,
    bidManagerId: '6', // Emily Davis
    description:
      'Seeking suppliers for frozen food items including vegetables, meats, and prepared meals.',
    estimatedValue: '$350,000',
    organizationId: 'coop-456', // Central State Cooperative
    organizationType: 'co-op' as const,
  },
  {
    id: 6,
    name: 'Bread', // New bid for bread category
    note: 'Bread products including sandwich bread, rolls, and buns',
    bidYear: '2023-2024',
    category: 'CAT-001', // Bread
    status: 'Released',
    awardType: 'Line Item',
    startDate: new Date('2023-06-01'),
    endDate: new Date('2024-05-31'),
    anticipatedOpeningDate: new Date('2023-07-15T10:00:00'),
    awardDate: null,
    bidManagerId: '1', // John Smith
    description:
      'Seeking suppliers for bread products including sandwich bread, rolls, and buns.',
    estimatedValue: '$180,000',
    organizationId: 'coop-456', // Central State Cooperative
    organizationType: 'co-op' as const,
  },
  {
    id: 7,
    name: 'Bagel', // New bid for bagel category
    note: 'Bagel products for breakfast programs',
    bidYear: '2023-2024',
    category: 'CAT-013', // Bagel
    status: 'In Process',
    awardType: 'Bottom Line',
    startDate: new Date('2023-08-01'),
    endDate: new Date('2024-07-31'),
    anticipatedOpeningDate: new Date('2023-09-01T14:00:00'),
    awardDate: null,
    bidManagerId: '2', // Alex Ramirez
    description: 'Seeking suppliers for bagel products for breakfast programs.',
    estimatedValue: '$95,000',
    organizationId: 'district-123', // Springfield School District
    organizationType: 'district' as const,
  },
];

// Bid status badge colors - updated for new status values
export const statusColors = {
  'In Process':
    'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100',
  Released: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100',
  Opened: 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-100',
  Awarded: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100',
  Canceled: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100',
  Archived: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100',
};

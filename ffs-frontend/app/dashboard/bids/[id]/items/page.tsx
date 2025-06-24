'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  ArrowRight,
  Download,
  Search,
  Eye,
  Pencil,
  Trash2,
  Plus,
} from 'lucide-react';
import { mockBids } from '@/data/mock-bids';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { hasBidRole } from '@/types/user';
import type { User } from '@/types/user';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { ViewBidItemModal } from '@/components/dashboard/view-bid-item-modal';
import { DeleteBidItemConfirmation } from '@/components/dashboard/delete-bid-item-confirmation';
import { AddBidItemModal } from '@/components/bid-Item/AddBidItemModal';
import { ViewAwardGroupModal } from '@/components/dashboard/view-award-group-modal';
import { AddEditAwardGroupModal } from '@/components/dashboard/add-edit-award-group-modal';
import { createBidItem, type CreateBidItemRequest } from '@/lib/api/bid-items';

// Mock bid items data with acceptableBrands
const mockBidItems = [
  {
    id: 'FR12957',
    bidId: 'BID-2023-001',
    bidName: '2023 Frozen Foods Bid',
    awardGroup: 'Albies',
    itemName: 'Calzone, Buffalo Chicken, WG, 2MMA/2GE',
    diversion: 'No',
    status: 'Active',
    projection: 525,
    projectionUnit: 'Case',
    minProjection: 50,
    totalBidUnits: 25200,
    bidUnit: 'EA',
    bidUnitProjUnit: 48.0,
    percentDistrictsUsing: 23,
    acceptableBrands: 'Albies, Bosco, Ginos',
  },
  {
    id: 'FR12959',
    bidId: 'BID-2023-001',
    bidName: '2023 Frozen Foods Bid',
    awardGroup: 'Albies',
    itemName: 'Calzone, Cheeseburger, WG, 2MMA/2GE',
    diversion: 'No',
    status: 'Active',
    projection: 143,
    projectionUnit: 'Case',
    minProjection: 50,
    totalBidUnits: 6864,
    bidUnit: 'EA',
    bidUnitProjUnit: 48.0,
    percentDistrictsUsing: 15,
    acceptableBrands: 'Albies, Bosco',
  },
  {
    id: 'FR12958',
    bidId: 'BID-2023-001',
    bidName: '2023 Frozen Foods Bid',
    awardGroup: 'Albies',
    itemName: 'Calzone, Cheese, WG, 2MMA/2GE',
    diversion: 'No',
    status: 'Active',
    projection: 743,
    projectionUnit: 'Case',
    minProjection: 50,
    totalBidUnits: 35664,
    bidUnit: 'EA',
    bidUnitProjUnit: 48.0,
    percentDistrictsUsing: 27,
    acceptableBrands: "Albies, Bosco, Ginos, Tony's",
  },
  {
    id: 'FR13582',
    bidId: 'BID-2023-002',
    bidName: '2023 Produce Bid',
    awardGroup: 'Washington Produce',
    itemName: 'Apples, Red Delicious, 125-138 ct',
    diversion: 'No',
    status: 'Active',
    projection: 60,
    projectionUnit: 'Case',
    minProjection: 50,
    totalBidUnits: 2880,
    bidUnit: 'EA',
    bidUnitProjUnit: 48.0,
    percentDistrictsUsing: 2,
    acceptableBrands: 'Washington Apples, Rainier Fruit',
  },
  {
    id: 'FR12960',
    bidId: 'BID-2023-002',
    bidName: '2023 Produce Bid',
    awardGroup: 'Tropical Fruits',
    itemName: 'Bananas, 40 lb',
    diversion: 'No',
    status: 'Active',
    projection: 202,
    projectionUnit: 'Case',
    minProjection: 50,
    totalBidUnits: 9696,
    bidUnit: 'EA',
    bidUnitProjUnit: 48.0,
    percentDistrictsUsing: 8,
    acceptableBrands: 'Dole, Chiquita, Del Monte',
  },
  {
    id: 'FR12961',
    bidId: 'BID-2023-003',
    bidName: '2023 Dairy Bid',
    awardGroup: 'Dairy',
    itemName: 'Milk, 1%, 8 oz',
    diversion: 'No',
    status: 'Active',
    projection: 10,
    projectionUnit: 'Case',
    minProjection: 10,
    totalBidUnits: 720,
    bidUnit: 'EA',
    bidUnitProjUnit: 72.0,
    percentDistrictsUsing: 2,
    acceptableBrands: "Borden, Prairie Farms, Dean's",
  },
  {
    id: 'FR12962',
    bidId: 'BID-2023-003',
    bidName: '2023 Dairy Bid',
    awardGroup: 'Dairy',
    itemName: 'Cheese, Cheddar, Shredded, 5 lb',
    diversion: 'No',
    status: 'Active',
    projection: 365,
    projectionUnit: 'Case',
    minProjection: 10,
    totalBidUnits: 14600,
    bidUnit: 'EA',
    bidUnitProjUnit: 40.0,
    percentDistrictsUsing: 8,
    acceptableBrands: "Kraft, Land O'Lakes, Sargento",
  },
  {
    id: 'FR13651',
    bidId: 'BID-2023-004',
    bidName: '2023 Bread Bid',
    awardGroup: 'Bakecrafter',
    itemName:
      'Breakfast Empanada, Egg, Cheese & Turkey Sausage WG, 1 MMA/1.25GE',
    diversion: 'No',
    status: 'Active',
    projection: 75,
    projectionUnit: 'Case',
    minProjection: 50,
    totalBidUnits: 6750,
    bidUnit: 'SVG',
    bidUnitProjUnit: 90.0,
    percentDistrictsUsing: 6,
    acceptableBrands: 'Bakecrafter, Los Cabos',
  },
  {
    id: 'FR13655',
    bidId: 'BID-2023-004',
    bidName: '2023 Bread Bid',
    awardGroup: 'Bakecrafter',
    itemName: 'Breakfast Sandwich, Croissant, Egg and Cheese, WG, 1 MMA /1 GE',
    diversion: 'Yes',
    status: 'Active',
    projection: 57,
    projectionUnit: 'Case',
    minProjection: 50,
    totalBidUnits: 5700,
    bidUnit: 'SVG',
    bidUnitProjUnit: 100.0,
    percentDistrictsUsing: 8,
    acceptableBrands: 'Bakecrafter, Pillsbury',
  },
  {
    id: 'FR11728',
    bidId: 'BID-2023-005',
    bidName: '2023 Paper Goods Bid',
    awardGroup: 'Paper Products',
    itemName: 'Napkins, White, 1-ply',
    diversion: 'Yes',
    status: 'Active',
    projection: 194,
    projectionUnit: 'Case',
    minProjection: 50,
    totalBidUnits: 20952,
    bidUnit: 'SVG',
    bidUnitProjUnit: 108.0,
    percentDistrictsUsing: 10,
    acceptableBrands: 'Georgia-Pacific, Tork, Vanity Fair',
  },
];

export default function BidItemsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [userData, setUserData] = useState<User | null>(null);
  const [bid, setBid] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('all-items');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100);
  const [awardGroups, setAwardGroups] = useState<
    { name: string; itemCount: number; items: any[] }[]
  >([]);

  // Modal states
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Award Group modal states
  const [selectedAwardGroup, setSelectedAwardGroup] = useState<string>('');
  const [selectedAwardGroupItems, setSelectedAwardGroupItems] = useState<any[]>(
    []
  );
  const [isViewAwardGroupModalOpen, setIsViewAwardGroupModalOpen] =
    useState(false);
  const [isAddEditAwardGroupModalOpen, setIsAddEditAwardGroupModalOpen] =
    useState(false);
  const [isEditAwardGroup, setIsEditAwardGroup] = useState(false);

  // Load user data and bid data
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserData(parsedUser);
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    }

    // Load bid data
    const foundBid = mockBids.find((b) => b.id.toString() === params.id);
    if (foundBid) {
      setBid(foundBid);
    }

    setLoading(false);
  }, [params.id]);

  // Filter items based on search query, active tab, and specific bid
  useEffect(() => {
    // Start with items only for this specific bid
    let filtered = mockBidItems.filter((item) => item.bidId === params.id);

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.itemName.toLowerCase().includes(query) ||
          item.id.toLowerCase().includes(query) ||
          (item.awardGroup && item.awardGroup.toLowerCase().includes(query)) ||
          item.bidName.toLowerCase().includes(query) ||
          item.acceptableBrands.toLowerCase().includes(query)
      );
    }

    // Apply tab filter
    switch (activeTab) {
      case 'grouped-items':
        // Filter items that have a non-empty award group
        filtered = filtered.filter(
          (item) => item.awardGroup && item.awardGroup.trim() !== ''
        );
        break;
      case 'ungrouped-items':
        // Filter items that have an empty or null award group
        filtered = filtered.filter(
          (item) => !item.awardGroup || item.awardGroup.trim() === ''
        );
        break;
      case 'inactive-items':
        filtered = filtered.filter((item) => item.status !== 'Active');
        break;
      case 'diversion-item':
        filtered = filtered.filter((item) => item.diversion === 'Yes');
        break;
      case 'non-diversion-item':
        filtered = filtered.filter((item) => item.diversion === 'No');
        break;
      case 'active-items':
        filtered = filtered.filter((item) => item.status === 'Active');
        break;
      default:
        // All items, no additional filtering
        break;
    }

    setFilteredItems(filtered);
  }, [searchQuery, activeTab, params.id]);

  // Calculate award groups from filtered items
  useEffect(() => {
    const bidItems = mockBidItems.filter((item) => item.bidId === params.id);
    const groups: Record<string, any[]> = {};

    bidItems.forEach((item) => {
      if (item.awardGroup && item.awardGroup.trim() !== '') {
        if (!groups[item.awardGroup]) {
          groups[item.awardGroup] = [];
        }
        groups[item.awardGroup].push(item);
      }
    });

    const formattedGroups = Object.entries(groups).map(([name, items]) => ({
      name,
      itemCount: items.length,
      items,
    }));

    setAwardGroups(formattedGroups);
  }, [params.id]);

  // Calculate pagination
  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredItems.length);
  const currentItems = filteredItems.slice(startIndex, endIndex);

  // Get category name by ID
  const getCategoryName = (categoryId: string) => {
    const categories = [
      { id: '1', name: 'Frozen' },
      { id: '2', name: 'Bread' },
      { id: '3', name: 'Produce' },
      { id: '4', name: 'Dairy' },
      { id: '5', name: 'Meat' },
      { id: '6', name: 'Grocery' },
      { id: '7', name: 'Paper' },
      { id: '8', name: 'Cleaning' },
    ];
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : 'Unknown category';
  };

  // Handle actions for bid items
  const handleViewItem = (item: any) => {
    setSelectedItem(item);
    setIsEditMode(false);
    setIsViewModalOpen(true);
  };

  const handleEditItem = (item: any) => {
    setSelectedItem(item);
    setIsEditMode(true);
    setIsViewModalOpen(true);
  };

  const handleDeletePrompt = (item: any) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteItem = () => {
    // In a real app, you would delete the item from the database
    console.log(
      `Deleting item ${selectedItem.id} from bid ${selectedItem.bidId}`
    );

    // Close the modal
    setIsDeleteModalOpen(false);

    // Remove the item from the local state
    const updatedItems = filteredItems.filter(
      (item) => item.id !== selectedItem.id
    );
    setFilteredItems(updatedItems);

    // Show a toast notification (in a real app)
    // toast.success("Bid item deleted successfully")
  };

  const handleSaveItem = (updatedItem: any) => {
    // In a real app, you would update the item in the database
    console.log(`Saving updated item`, updatedItem);

    // Update the item in the local state
    const updatedItems = filteredItems.map((item) =>
      item.id === updatedItem.id ? updatedItem : item
    );
    setFilteredItems(updatedItems);

    // Show a toast notification (in a real app)
    // toast.success("Bid item updated successfully")
  };

  const handleAddItem = async (newItem: {
    itemName: string;
    awardGroup?: string;
    projectionUnit: string;
    bidUnit: string;
    bidUnitProjUnit: number;
    minProjection?: number;
    status?: string;
    diversion?: string;
    acceptableBrands?: string;
    bidSpecification?: string;
    projection?: number;
    totalBidUnits?: number;
    percentDistrictsUsing?: number;
  }) => {
    try {
      const bidItemData: CreateBidItemRequest = {
        bidId: parseInt(params.id),
        itemName: newItem.itemName,
        awardGroup: newItem.awardGroup,
        projectionUnit: newItem.projectionUnit,
        bidUnit: newItem.bidUnit,
        bidUnitProjUnit: newItem.bidUnitProjUnit,
        minProjection: newItem.minProjection || undefined,
        status: newItem.status,
        diversion: newItem.diversion,
        acceptableBrands: newItem.acceptableBrands,
        bidSpecification: newItem.bidSpecification,
        projection: newItem.projection,
        totalBidUnits: newItem.totalBidUnits,
        percentDistrictsUsing: newItem.percentDistrictsUsing,
      };

      const createdItem = await createBidItem(bidItemData);

      setFilteredItems((prev) => [createdItem, ...prev]);

      console.log('Bid item created successfully:', createdItem);
    } catch (error) {
      console.error('Failed to create bid item:', error);
    }
  };

  const handleRowClick = (item: any) => {
    handleViewItem(item);
  };

  // Handle actions for award groups
  const handleViewAwardGroup = (groupName: string) => {
    const groupItems =
      awardGroups.find((group) => group.name === groupName)?.items || [];
    setSelectedAwardGroup(groupName);
    setSelectedAwardGroupItems(groupItems);
    setIsViewAwardGroupModalOpen(true);
  };

  const handleAddAwardGroup = () => {
    setSelectedAwardGroup('');
    setSelectedAwardGroupItems([]);
    setIsEditAwardGroup(false);
    setIsAddEditAwardGroupModalOpen(true);
  };

  const handleEditAwardGroup = (groupName: string) => {
    const group = awardGroups.find((g) => g.name === groupName);
    if (group) {
      setSelectedAwardGroup(groupName);
      setSelectedAwardGroupItems(group.items);
      setIsEditAwardGroup(true);
      setIsAddEditAwardGroupModalOpen(true);
    }
  };

  const handleDeleteAwardGroup = (groupName: string) => {
    // In a real app, you would delete the award group from the database
    console.log(`Deleting award group ${groupName}`);

    // Update the local state
    setAwardGroups((prev) => prev.filter((group) => group.name !== groupName));

    // In a real app, you would also update the items to remove the award group
    // toast.success("Award group deleted successfully")
  };

  const handleSaveAwardGroup = (data: { name: string; itemIds: string[] }) => {
    // In a real app, you would save the award group to the database
    console.log(`Saving award group`, data);

    if (isEditAwardGroup) {
      // Update existing award group
      setAwardGroups((prev) => {
        const updatedGroups = prev.filter(
          (group) => group.name !== selectedAwardGroup
        );
        const items = mockBidItems.filter((item) =>
          data.itemIds.includes(item.id)
        );
        return [
          ...updatedGroups,
          { name: data.name, itemCount: items.length, items },
        ];
      });
    } else {
      // Add new award group
      const items = mockBidItems.filter((item) =>
        data.itemIds.includes(item.id)
      );
      setAwardGroups((prev) => [
        ...prev,
        { name: data.name, itemCount: items.length, items },
      ]);
    }

    // In a real app, you would also update the items to set the award group
    // toast.success(`Award group ${isEditAwardGroup ? 'updated' : 'created'} successfully`)
  };

  // Check if user has permission to access this page
  const hasAccess =
    userData &&
    (hasBidRole(userData, 'Bid Administrator') ||
      (userData.managedBids && userData.managedBids.length > 0));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="space-y-4">
        <div className="bg-white p-8 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-700">Access Denied</h2>
          <p className="text-muted-foreground mt-2">
            You do not have permission to view bid items. Please contact your
            administrator.
          </p>
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard')}
            className="mt-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!bid) {
    return (
      <div className="space-y-4">
        <div className="bg-white p-8 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-700">Bid Not Found</h2>
          <p className="text-muted-foreground mt-2">
            The requested bid could not be found.
          </p>
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/bids/all')}
            className="mt-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Bids
          </Button>
        </div>
      </div>
    );
  }

  const bidName = `${bid?.bidYear} ${getCategoryName(bid?.category || '')} Bid`;

  const breadcrumbItems = [
    { label: 'Bids', href: '/dashboard/bids/all' },
    { label: bidName, href: `/dashboard/bids/${params.id}` },
    { label: 'Bid Items' },
  ];

  return (
    <div className="space-y-6">
      {/* Header with navigation */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* Page title and actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Bid Items</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Bid Item
        </Button>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full mt-0"
      >
        <TabsList className="mb-4 flex flex-wrap">
          <TabsTrigger value="all-items">All Items</TabsTrigger>
          <TabsTrigger value="grouped-items">Grouped Items</TabsTrigger>
          <TabsTrigger value="ungrouped-items">Ungrouped Items</TabsTrigger>
          <TabsTrigger value="inactive-items">Inactive Items</TabsTrigger>
          <TabsTrigger value="diversion-item">Diversion Item</TabsTrigger>
          <TabsTrigger value="non-diversion-item">
            Non Diversion Item
          </TabsTrigger>
          <TabsTrigger value="active-items">Active Items</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Input
                placeholder="Search by keyword"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64"
              />
              <Button variant="secondary">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-sm text-gray-500 ml-auto">
              Showing {startIndex + 1}-{endIndex} of {filteredItems.length}
              <Button variant="ghost" size="sm" className="ml-2">
                <Download className="h-4 w-4 mr-1" /> Export
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">
                      Award Group
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      Item Name
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      Diversion
                    </TableHead>
                    <TableHead className="whitespace-nowrap">Status</TableHead>
                    <TableHead className="whitespace-nowrap">ID</TableHead>
                    <TableHead className="whitespace-nowrap">
                      Projection
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      Projection Unit
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      Min. Projection
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      Total Bid Units
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      Bid Unit
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      Bid Unit/Proj. Unit
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      % of Districts Using
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      Acceptable Brands
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-center">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={14}
                        className="text-center py-8 text-gray-500"
                      >
                        No bid items found
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentItems.map((item) => (
                      <TableRow
                        key={item.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleRowClick(item)}
                      >
                        <TableCell className="whitespace-nowrap">
                          {item.awardGroup || '—'}
                        </TableCell>
                        <TableCell
                          className="whitespace-nowrap truncate"
                          title={item.itemName}
                        >
                          <div className="truncate max-w-[280px]">
                            {item.itemName}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {item.diversion}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              item.status === 'Active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {item.status}
                          </span>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {item.id}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-right">
                          {item.projection}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {item.projectionUnit}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-right">
                          {item.minProjection}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-right">
                          {item.totalBidUnits.toLocaleString()}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {item.bidUnit}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-right">
                          {item.bidUnitProjUnit.toFixed(1)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-right">
                          {item.percentDistrictsUsing}%
                        </TableCell>
                        <TableCell
                          className="whitespace-nowrap truncate"
                          title={item.acceptableBrands}
                        >
                          {item.acceptableBrands}
                        </TableCell>
                        <TableCell
                          className="whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex justify-center space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewItem(item);
                              }}
                              className="h-8 w-8 p-0"
                              title="View"
                            >
                              <Eye className="h-4 w-4 text-blue-600" />
                              <span className="sr-only">View</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditItem(item);
                              }}
                              className="h-8 w-8 p-0"
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4 text-green-600" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePrompt(item);
                              }}
                              className="h-8 w-8 p-0"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) =>
                  setItemsPerPage(Number.parseInt(value))
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={`${itemsPerPage} per page`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="25">25 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                  <SelectItem value="100">100 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>

              <Select
                value={currentPage.toString()}
                onValueChange={(value) =>
                  setCurrentPage(Number.parseInt(value))
                }
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder={`Page ${currentPage}`} />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      Page {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <span className="text-sm text-gray-500">of {totalPages}</span>

              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Award Groups Section */}
      <div className="space-y-4 mt-8">
        {/* Page title and search */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold">Award Groups</h2>
            <p className="text-muted-foreground">
              Manage award groups for this bid
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleAddAwardGroup}>
              <Plus className="mr-2 h-4 w-4" />
              Add Award Group
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-md border overflow-hidden w-full">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">
                    Award Group
                  </TableHead>
                  <TableHead className="whitespace-nowrap text-center">
                    Number of Items
                  </TableHead>
                  <TableHead className="text-right whitespace-nowrap w-[120px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {awardGroups.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center py-8 text-gray-500"
                    >
                      No award groups found
                    </TableCell>
                  </TableRow>
                ) : (
                  awardGroups.map((group, index) => (
                    <TableRow
                      key={group.name}
                      className={`${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      } hover:bg-blue-50 h-12`}
                    >
                      <TableCell className="font-medium">
                        {group.name}
                      </TableCell>
                      <TableCell className="text-center">
                        {group.itemCount}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2 items-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => handleViewAwardGroup(group.name)}
                            title="View Award Group"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                            onClick={() => handleEditAwardGroup(group.name)}
                            title="Edit Award Group"
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteAwardGroup(group.name)}
                            title="Delete Award Group"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Bid Item Modals */}
      {selectedItem && (
        <ViewBidItemModal
          item={selectedItem}
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          isEditMode={isEditMode}
          onSave={handleSaveItem}
        />
      )}

      {selectedItem && (
        <DeleteBidItemConfirmation
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteItem}
          itemName={selectedItem.itemName}
          itemId={selectedItem.id}
        />
      )}

      <AddBidItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddItem}
        bidId={params.id}
        showBidSelection={false}
      />

      {/* Award Group Modals */}
      <ViewAwardGroupModal
        isOpen={isViewAwardGroupModalOpen}
        onClose={() => setIsViewAwardGroupModalOpen(false)}
        awardGroup={selectedAwardGroup}
        items={selectedAwardGroupItems}
      />

      <AddEditAwardGroupModal
        isOpen={isAddEditAwardGroupModalOpen}
        onClose={() => setIsAddEditAwardGroupModalOpen(false)}
        onSave={handleSaveAwardGroup}
        awardGroup={selectedAwardGroup}
        allItems={mockBidItems.filter((item) => item.bidId === params.id)}
        selectedItemIds={selectedAwardGroupItems.map((item) => item.id)}
        isEdit={isEditAwardGroup}
      />
    </div>
  );
}

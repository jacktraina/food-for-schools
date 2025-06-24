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
  Filter,
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
import { Badge } from '@/components/ui/badge';
import { hasBidRole } from '@/types/user';
import type { LoginResponseUser, Meta } from '@/types/auth';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { ViewBidItemModal } from '@/components/dashboard/view-bid-item-modal';
import { DeleteBidItemConfirmation } from '@/components/dashboard/delete-bid-item-confirmation';
import { AddBidItemModal } from '@/components/bid-Item/AddBidItemModal';
import { CreateBidItem } from '@/schemas/bidItemSchema';
import {
  useApiQuery,
  useDeleteMutation,
  usePatchMutation,
  usePostMutation,
} from '@/hooks/use-api';
import { AxiosError } from 'axios';
import { useToast } from '@/components/ui/toast-context';
import { BidItem } from '@/types/bid-item';

// Mock bid items data with acceptableBrands
const mockBidItems = [
  {
    id: 7,
    bidId: 1,
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
    id: 9,
    bidId: 1,
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
    id: 8,
    bidId: 1,
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
    id: 2,
    bidId: 2,
    bidName: '2023 Produce Bid',
    awardGroup: '',
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
    id: 0,
    bidId: 2,
    bidName: '2023 Produce Bid',
    awardGroup: null,
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
    id: 1,
    bidId: 3,
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
    id: 20,
    bidId: 3,
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
    id: 51,
    bidId: 4,
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
    id: 55,
    bidId: 4,
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
    id: 28,
    bidId: 5,
    bidName: '2023 Paper Goods Bid',
    awardGroup: '',
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

export default function AllBidItemsPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<LoginResponseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  //   const [filteredItems, setFilteredItems] = useState(mockBidItems);
  const [activeTab, setActiveTab] = useState('all-items');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100);
  const [selectedBid, setSelectedBid] = useState<string>('all');
  const [accessibleBids, setAccessibleBids] = useState<
    { id: number; name: string }[]
  >([]);

  // Modal states
  const [selectedItem, setSelectedItem] = useState<BidItem | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { toast } = useToast();

  // Load user data
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserData(parsedUser);

        // Filter bids based on user permissions
        const userBids = mockBids.filter((bid) => {
          // Include if user is a bid manager for this bid
          if (
            parsedUser.managedBids &&
            parsedUser.managedBids.includes(bid.id)
          ) {
            return true;
          }

          // Include if user is a bid administrator
          if (hasBidRole(parsedUser, 'Bid Administrator')) {
            return true;
          }

          return false;
        });

        setAccessibleBids(userBids);
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    }
    setLoading(false);
  }, []);

  const {
    data: bidItems,
    isLoading,
    refetch,
  } = useApiQuery<BidItem[]>(`/bid-items`, ['bid-items']);

  const { mutate: createBidItem, isPending: isPendingCreateBidItem } =
    usePostMutation<CreateBidItem, Meta>(`/bid-items`, {
      onSuccess: () => {
        toast({
          title: 'Success',
          description: `Bid item has been added successfully.`,
          variant: 'success',
        });
        setIsAddModalOpen(false);
      },
      onError: (error: AxiosError<Meta>) => {
        toast({
          title: 'Error',
          description: `${
            error?.response?.data?.error || 'Failed to add bid item'
          }`,
          variant: 'destructive',
        });
      },
    });

  const { mutate: updateBidItem, isPending: isPendingUpdateBidItem } =
    usePatchMutation<Partial<CreateBidItem>, Meta>(`/bid-items`, {
      onSuccess: () => {
        toast({
          title: 'Success',
          description: `Bid item has been updated successfully.`,
          variant: 'success',
        });
        setSelectedItem(null);
        setIsEditMode(false);
        setIsViewModalOpen(false);
        refetch();
      },
      onError: (error: AxiosError<Meta>) => {
        toast({
          title: 'Error',
          description: `${
            error?.response?.data?.error || 'Failed to updated bid item'
          }`,
          variant: 'destructive',
        });
      },
      enabled: !!selectedItem?.id,
    });

  const { mutate: deleteBidItem, isPending: isDeleteBidItemPending } =
    useDeleteMutation<Meta>('/bid-items', {
      onSuccess: () => {
        toast({
          title: 'Success',
          description: 'Bid item has been deleted successfully.',
          variant: 'success',
        });
        setIsDeleteModalOpen(false);
        refetch();
      },
      onError: (error: AxiosError<Meta>) => {
        toast({
          title: 'Error',
          description: `${
            error?.response?.data?.message || 'Failed to delete bid item'
          }`,
          variant: 'destructive',
        });
      },
      enabled: !!selectedItem?.id,
    });

  // Filter items based on search query, active tab, and selected bid
  //   useEffect(() => {
  //     let filtered = [...mockBidItems];

  //     // Apply bid filter
  //     if (selectedBid !== 'all') {
  //       filtered = filtered.filter((item) => item.bidId === selectedBid);
  //     }

  //     // Apply search filter
  //     if (searchQuery) {
  //       const query = searchQuery.toLowerCase();
  //       filtered = filtered.filter(
  //         (item) =>
  //           item.itemName.toLowerCase().includes(query) ||
  //           item.id.toLowerCase().includes(query) ||
  //           (item.awardGroup && item.awardGroup.toLowerCase().includes(query)) ||
  //           item.bidName.toLowerCase().includes(query) ||
  //           item.acceptableBrands.toLowerCase().includes(query)
  //       );
  //     }

  //     // Apply tab filter
  //     switch (activeTab) {
  //       case 'grouped-items':
  //         // Filter items that have a non-empty award group
  //         filtered = filtered.filter(
  //           (item) => item.awardGroup && item.awardGroup.trim() !== ''
  //         );
  //         break;
  //       case 'ungrouped-items':
  //         // Filter items that have an empty or null award group
  //         filtered = filtered.filter(
  //           (item) => !item.awardGroup || item.awardGroup.trim() === ''
  //         );
  //         break;
  //       case 'inactive-items':
  //         filtered = filtered.filter((item) => item.status !== 'Active');
  //         break;
  //       case 'diversion-item':
  //         filtered = filtered.filter((item) => item.diversion === 'Yes');
  //         break;
  //       case 'non-diversion-item':
  //         filtered = filtered.filter((item) => item.diversion === 'No');
  //         break;
  //       case 'active-items':
  //         filtered = filtered.filter((item) => item.status === 'Active');
  //         break;
  //       default:
  //         // All items, no additional filtering
  //         break;
  //     }

  //     setFilteredItems(filtered);
  //   }, [searchQuery, activeTab, selectedBid]);

  // Calculate pagination
  const totalItems = bidItems?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, bidItems?.length || 0);
  //   const currentItems = filteredItems.slice(startIndex, endIndex);

  // Handle actions
  const handleViewItem = (item: BidItem) => {
    setSelectedItem(item);
    setIsEditMode(false);
    setIsViewModalOpen(true);
  };

  const handleEditItem = (item: BidItem) => {
    setSelectedItem(item);
    setIsEditMode(true);
    setIsViewModalOpen(true);
  };

  const handleDeletePrompt = (item: BidItem) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteItem = () => {
    deleteBidItem(selectedItem?.id.toString() || '');
  };

  const handleSaveItem = (updatedItem: Partial<BidItem>) => {
    updateBidItem({
      data: updatedItem,
      id: selectedItem?.id.toString() || '',
    });
  };

  const handleAddItem = (newItem: CreateBidItem) => {
    createBidItem(newItem);
  };

  const handleRowClick = (item: BidItem) => {
    handleViewItem(item);
  };

  // Check if user has permission to access this page
  const hasAccess =
    userData &&
    (hasBidRole(userData, 'Bid Administrator') ||
      (userData.manageBids && userData.manageBids.length > 0));

  if (isLoading) {
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
            You do not have permission to view bid items across all bids. Please
            contact your administrator.
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

  const breadcrumbItems = [
    { label: 'Bids', href: '/dashboard/bids/all' },
    { label: 'Bid Items' },
  ];

  return (
    <div className="space-y-1">
      {/* Header with navigation */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* Page title and actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Bid Items</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Bid Item
        </Button>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 mb-0">
        {selectedBid !== 'all' && (
          <Button
            variant="outline"
            className="bg-gray-100"
            onClick={() => router.push(`/dashboard/bids/${selectedBid}/items`)}
          >
            Manage Selected Bid Items
          </Button>
        )}
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

        {bidItems && (
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

                {/* Bid filter */}
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <Select value={selectedBid} onValueChange={setSelectedBid}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Filter by bid" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Bids</SelectItem>
                      {accessibleBids.map((bid) => (
                        <SelectItem key={bid.id} value={bid.id.toString()}>
                          {bid.name || bid.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="text-sm text-gray-500 ml-auto">
                Showing {startIndex + 1}-{endIndex} of {bidItems.length}
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
                      <TableHead className="whitespace-nowrap">Bid</TableHead>
                      <TableHead className="whitespace-nowrap">
                        Award Group
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        Item Name
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        Diversion
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        Status
                      </TableHead>
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
                    {bidItems.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={15}
                          className="text-center py-8 text-gray-500"
                        >
                          No bid items found
                        </TableCell>
                      </TableRow>
                    ) : (
                      bidItems.map((item) => (
                        <TableRow
                          key={item.id}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleRowClick(item)}
                        >
                          <TableCell className="whitespace-nowrap">
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedBid(item.bidId?.toString() || '');
                              }}
                            >
                              {item.bidName}
                            </Badge>
                          </TableCell>
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
                            {item.totalBidUnits?.toLocaleString()}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {item.bidUnit}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-right">
                            {item.bidUnitProjUnit?.toFixed(1)}
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
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
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
        )}
      </Tabs>

      {/* View/Edit Modal */}
      {selectedItem && (
        <ViewBidItemModal
          item={selectedItem}
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          isEditMode={isEditMode}
          isLoading={isPendingUpdateBidItem}
          onSave={handleSaveItem}
        />
      )}

      {/* Delete Confirmation Modal */}
      {selectedItem && (
        <DeleteBidItemConfirmation
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteItem}
          itemName={selectedItem.itemName}
          itemId={selectedItem.id}
        />
      )}

      {/* Add Bid Item Modal */}
      <AddBidItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddItem}
        isLoading={isPendingCreateBidItem}
        showBidSelection={true}
      />
    </div>
  );
}

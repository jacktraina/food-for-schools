'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
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
import {
  PlusCircle,
  FileEdit,
  Eye,
  Trash2,
  Download,
  ArrowLeft,
  ArrowRight,
  User,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CreateBidModal } from '@/components/dashboard/create-bid-modal';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { useToast } from '@/components/ui/toast-context';
import type { User as UserType } from '@/types/user';
import { useDeleteMutation, usePostMutation } from '@/hooks/use-api';
import { usePaginatedBids } from '@/hooks/useBids';
import { AxiosError } from 'axios';
import { Meta } from '@/types/auth';

import { Bid as BidType } from '@/lib/api/bids';
import { getFullName } from '@/types/user';
import { BidFiltersModal } from '@/components/dashboard/bid-filters-modal';
import { ViewAwardGroupModal } from '@/components/dashboard/view-award-group-modal';
import { AddEditAwardGroupModal } from '@/components/dashboard/add-edit-award-group-modal';

// Define types for better performance and type safety
interface Bid {
  id: string;
  name: string;
  bidYear: string;
  status: string;
  awardType: string;
  startDate: Date | null;
  endDate: Date | null;
  anticipatedOpeningDate: Date | null;
  bidManagerId: string;
  organizationId: string;
  organizationType: string;
  note?: string;
  category?: string;
  description?: string;
  estimatedValue?: string;
  awardDate?: Date | null;
  external_id?: string;
}

// Status colors mapping
const statusColors = {
  'In Process': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Released: 'bg-blue-100 text-blue-800 border-blue-200',
  Opened: 'bg-green-100 text-green-800 border-green-200',
  Awarded: 'bg-purple-100 text-purple-800 border-purple-200',
  Canceled: 'bg-red-100 text-red-800 border-red-200',
  Cancelled: 'bg-red-100 text-red-800 border-red-200',
  Archived: 'bg-gray-100 text-gray-800 border-gray-200',
  Draft: 'bg-gray-100 text-gray-800 border-gray-200',
  Published: 'bg-blue-100 text-blue-800 border-blue-200',
  Closed: 'bg-red-100 text-red-800 border-red-200',
};

function BidsContent() {
  const router = useRouter();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);
  const { toast } = useToast();
  const [userData, setUserData] = useState<UserType | null>(null);
  const [localMockUsers, setLocalMockUsers] = useState<any[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    year: 'all',
    status: 'all',
    awardType: 'all',
    myBids: false,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const {
    data: paginatedData,
    isLoading: bidsLoading,
    refetch: refetchBids,
  } = usePaginatedBids({
    page: currentPage,
    limit: itemsPerPage,
    search: searchQuery || undefined,
    bidYear: filters.year !== 'all' ? filters.year : undefined,
    status: filters.status !== 'all' ? filters.status : undefined,
    awardType: filters.awardType !== 'all' ? filters.awardType : undefined,
    myBids: filters.myBids || undefined,
  });

  const { mutate: deleteBid, isPending: isDeleteBidPending } =
    useDeleteMutation<Meta>('/bids', {
      onSuccess: () => {
        toast({
          title: 'Success',
          description: ' Bid has been deleted successfully.',
          variant: 'success',
        });
        setSelectedBid(null);
        setDeleteModalOpen(false);
        refetchBids();
      },
      onError: (error: AxiosError<Meta>) => {
        toast({
          title: 'Error',
          description: `${
            error?.response?.data?.error || 'Failed to delete Bid'
          }`,
          variant: 'destructive',
        });
      },
      enabled: !!selectedBid?.id,
    });

  const bids = paginatedData?.bids || [];
  const pagination = paginatedData?.pagination || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  };

  const [bidYears, setBidYears] = useState<string[]>([]);

  // Filters modal state
  const [filtersModalOpen, setFiltersModalOpen] = useState(false);

  // Award Group states
  const [awardGroups, setAwardGroups] = useState<
    { name: string; itemCount: number; items: any[] }[]
  >([]);
  const [selectedAwardGroup, setSelectedAwardGroup] = useState<string>('');
  const [selectedAwardGroupItems, setSelectedAwardGroupItems] = useState<any[]>(
    []
  );
  const [isViewAwardGroupModalOpen, setIsViewAwardGroupModalOpen] =
    useState(false);
  const [isAddEditAwardGroupModalOpen, setIsAddEditAwardGroupModalOpen] =
    useState(false);
  const [isEditAwardGroup, setIsEditAwardGroup] = useState(false);

  // Mock bid items data for award groups (keeping this as mock for now)
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
  ];

  // Add this state for available statuses
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);

  // Load data from database
  const loadData = async () => {
    try {
      // Load user data
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser) as UserType;
        setUserData(parsedUser);
      }

      // Load users from API
      const usersResponse = await fetch('/api/users');
      if (usersResponse.ok) {
        const users = await usersResponse.json();
        setLocalMockUsers(users);
        localStorage.setItem('mockUsers', JSON.stringify(users));
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    loadData();
  }, [toast]);

  useEffect(() => {
    if (bids && bids.length > 0) {
      const transformedBids = bids.map((bid: BidType) => ({
        ...bid,
        startDate: bid.startDate ? new Date(bid.startDate) : null,
        endDate: bid.endDate ? new Date(bid.endDate) : null,
        anticipatedOpeningDate: bid.anticipatedOpeningDate
          ? new Date(bid.anticipatedOpeningDate)
          : null,
        awardDate: bid.awardDate ? new Date(bid.awardDate) : null,
      }));

      const years = [
        ...new Set(transformedBids.map((bid: any) => bid.bidYear.toString())),
      ] as string[];
      years.sort((a: string, b: string) => b.localeCompare(a));
      setBidYears(years);

      const statuses = [
        ...new Set(
          transformedBids.map((bid: any) => bid.status).filter(Boolean)
        ),
      ] as string[];
      setAvailableStatuses(statuses);
    }
  }, [bids]);

  // Calculate award groups from all bid items
  useEffect(() => {
    const groups: Record<string, any[]> = {};

    mockBidItems.forEach((item) => {
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
  }, []);

  // Calculate active filter count - memoized to prevent recalculation
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.year !== 'all') count++;
    if (
      filters.status.length < availableStatuses.length &&
      availableStatuses.length > 0
    )
      count++;
    if (filters.awardType !== 'all') count++;
    if (filters.myBids) count++;
    return count;
  }, [filters, availableStatuses]);

  // Helper function to get bid manager name by ID - memoized
  const getBidManagerName = useCallback(
    (managerId: string | undefined) => {
      if (!managerId) return 'Not assigned';

      try {
        // Try to find the manager in the local users array
        const manager = localMockUsers.find((user) => user.id === managerId);
        if (manager) return getFullName(manager);
      } catch (error) {
        console.error('Error getting bid manager name:', error);
      }

      return 'Not assigned';
    },
    [localMockUsers]
  );

  const totalItems = pagination.total;
  const totalPages = pagination.totalPages;
  const currentBids = bids;

  // Calculate pagination values - memoized
  const paginationData = useMemo(() => {
    const totalItems = pagination.total;
    const totalPages = pagination.totalPages;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

    return {
      totalItems,
      totalPages,
      startIndex,
      endIndex,
      currentPage,
      itemsPerPage,
    };
  }, [pagination.total, pagination.totalPages, currentPage, itemsPerPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters]);

  // Check if user can edit bids - memoized
  const canEditBids = useCallback(
    (bid?: any): boolean => {
      if (!userData) return false;

      // Administrator can always edit
      if (
        userData.roles.some(
          (role) =>
            role.type === 'Group Admin' || role.type === 'District Admin'
        )
      )
        return true;

      // Bid Administrator with specific permissions
      if (
        userData.bidRoles &&
        userData.bidRoles.some(
          (role) =>
            role.type === 'Bid Administrator' &&
            role.permissions.includes('edit_bids')
        )
      )
        return true;

      // Check if user is specifically assigned as a manager for this bid
      if (bid && userData.managedBids && userData.managedBids.includes(bid.id))
        return true;

      return false;
    },
    [userData]
  );

  // Check if user is a bid manager - memoized
  const isBidManager = useCallback((): boolean => {
    if (!userData) return false;
    return userData.managedBids && userData.managedBids.length > 0;
  }, [userData]);

  // Check if a specific bid is managed by the current user - memoized
  const isUserManagedBid = useCallback(
    (bid: any): boolean => {
      if (!userData || !userData.managedBids) return false;
      return userData.managedBids.includes(bid.id);
    },
    [userData]
  );

  // Helper function to get bid manager name by ID - memoized
  // const getBidManagerName = useCallback(
  //   (managerId: string) => {
  //     if (!managerId) return "Not assigned"

  //     try {
  //       // Try to find the manager in the local users array
  //       const manager = localMockUsers.find((user) => user.id === managerId)
  //       if (manager) return getFullName(manager)
  //     } catch (error) {
  //       console.error("Error getting bid manager name:", error)
  //     }

  //     return "Not assigned"
  //   },
  //   [localMockUsers],
  // )

  const { mutate: createBidMutation, isPending: isCreatingBid } =
    usePostMutation<any, BidType>('/bids', {
      onSuccess: (createdBid: BidType) => {
        toast({
          title: 'Bid Created',
          description: `Bid ${createdBid.id} has been successfully created.`,
          variant: 'success',
        });
        setCreateModalOpen(false);
        loadData();
      },
      onError: (error: AxiosError<Meta>) => {
        toast({
          title: 'Error',
          description: error?.response?.data?.error || 'Failed to create bid',
          variant: 'destructive',
        });
      },
    });

  const handleCreateBid = (newBid: any) => {
    createBidMutation(newBid);
  };

  const handleDeleteClick = (bid: any) => {
    setSelectedBid(bid);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    deleteBid(selectedBid?.id.toString() || '');
  };

  const handleViewBid = (bid: any) => {
    router.push(`/dashboard/bids/${bid.id}`);
  };

  const handleExportBids = () => {
    toast({
      title: 'Exporting Bids',
      description: 'Your bids are being exported to a spreadsheet.',
      variant: 'success',
    });
  };

  const handleApplyFilters = (newFilters: any) => {
    setFilters({
      year: newFilters.year,
      status: Array.isArray(newFilters.status)
        ? newFilters.status[0] || 'all'
        : newFilters.status,
      awardType: newFilters.awardType,
      myBids: newFilters.myBids,
    });
  };

  // Toggle My Bids filter
  const toggleMyBids = () => {
    setFilters((prev) => ({
      ...prev,
      myBids: !prev.myBids,
    }));
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

    toast({
      title: 'Award Group Deleted',
      description: `Award group ${groupName} has been deleted.`,
      variant: 'success',
    });
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
      toast({
        title: 'Award Group Updated',
        description: `Award group ${data.name} has been updated.`,
        variant: 'success',
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
      toast({
        title: 'Award Group Created',
        description: `Award group ${data.name} has been created.`,
        variant: 'success',
      });
    }
  };

  // Loading state
  //   if (bidsLoading) {
  //     return (
  //       <div className="space-y-4">
  //         <div className="flex justify-between items-center">
  //           <h1 className="text-2xl font-bold">Bids</h1>
  //         </div>
  //         <div className="h-96 flex items-center justify-center">
  //           <div className="animate-pulse flex flex-col items-center">
  //             <div className="h-8 w-8 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
  //             <p className="text-gray-500">Loading bids...</p>
  //           </div>
  //         </div>
  //       </div>
  //     );
  //   }

  return (
    <div className="space-y-4">
      {/* Page title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Bids</h1>

        <div className="flex gap-2">
          {canEditBids() && (
            <Button variant="default" onClick={() => setCreateModalOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Bid
            </Button>
          )}
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Input
              placeholder="Search by keyword"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-full"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Filters button */}
          <Button
            variant="outline"
            onClick={() => setFiltersModalOpen(true)}
            className="flex items-center gap-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Filters
            {activeFilterCount > 0 && (
              <Badge
                variant="secondary"
                className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full"
              >
                {activeFilterCount}
              </Badge>
            )}
          </Button>

          {/* My Bids button - only show if user is a bid manager */}
          {isBidManager() && (
            <Button
              variant={filters.myBids ? 'default' : 'outline'}
              onClick={toggleMyBids}
              className="flex items-center gap-1"
            >
              <User className="h-4 w-4" />
              My Bids
            </Button>
          )}
        </div>
        <div className="text-sm text-gray-500 ml-auto">
          Showing {paginationData.startIndex + 1}-{paginationData.endIndex} of{' '}
          {paginationData.totalItems}
          <Button
            variant="ghost"
            size="sm"
            className="ml-2"
            onClick={handleExportBids}
          >
            <Download className="h-4 w-4 mr-1" /> Export
          </Button>
        </div>
      </div>

      {bidsLoading ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Bids</h1>
          </div>
          <div className="h-28 flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-8 w-8 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500">Loading bids...</p>
            </div>
          </div>
        </div>
      ) : (
        currentBids && (
          <>
            {/* Table */}
            <div className="bg-white rounded-md border overflow-hidden w-full">
              <div className="overflow-x-auto">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap w-[80px]">
                        Bid ID
                      </TableHead>
                      <TableHead className="whitespace-nowrap max-w-[200px]">
                        <div className="truncate">Bid Name</div>
                      </TableHead>
                      <TableHead className="whitespace-nowrap w-[80px]">
                        Bid Year
                      </TableHead>
                      <TableHead className="whitespace-nowrap w-[100px]">
                        Status
                      </TableHead>
                      <TableHead className="whitespace-nowrap w-[120px]">
                        Award Type
                      </TableHead>
                      <TableHead className="whitespace-nowrap w-[120px]">
                        Start Date
                      </TableHead>
                      <TableHead className="whitespace-nowrap w-[120px]">
                        End Date
                      </TableHead>
                      <TableHead className="whitespace-nowrap w-[120px]">
                        Opening Date
                      </TableHead>
                      <TableHead className="whitespace-nowrap w-[150px]">
                        Bid Manager
                      </TableHead>
                      <TableHead className="text-right whitespace-nowrap w-[120px]">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentBids.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={10}
                          className="text-center py-8 text-gray-500"
                        >
                          No bids found
                        </TableCell>
                      </TableRow>
                    ) : (
                      currentBids.map((bid: any, index: number) => (
                        <TableRow
                          key={bid.id}
                          className={`${
                            isUserManagedBid(bid)
                              ? 'bg-blue-50 hover:bg-blue-100'
                              : index % 2 === 0
                              ? 'bg-white'
                              : 'bg-gray-50'
                          } cursor-pointer hover:bg-blue-50 h-12`}
                          onClick={() => handleViewBid(bid)}
                        >
                          <TableCell className="font-medium whitespace-nowrap">
                            {bid.id}
                          </TableCell>
                          <TableCell className="max-w-[200px]">
                            <div className="truncate" title={bid.name}>
                              {bid.name}
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {bid.bidYear}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge
                              variant="outline"
                              className={
                                statusColors[
                                  bid.status as keyof typeof statusColors
                                ] || 'bg-gray-100 text-gray-800'
                              }
                            >
                              {bid.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {bid.awardType || 'Not specified'}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {bid.startDate
                              ? format(new Date(bid.startDate), 'MMM d, yyyy')
                              : 'Not set'}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {bid.endDate
                              ? format(new Date(bid.endDate), 'MMM d, yyyy')
                              : 'Not set'}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {bid.anticipatedOpeningDate
                              ? format(
                                  new Date(bid.anticipatedOpeningDate),
                                  'MMM d, yyyy'
                                )
                              : 'Not set'}
                          </TableCell>
                          <TableCell className="whitespace-nowrap max-w-[150px]">
                            <div
                              className="truncate"
                              title={getBidManagerName(bid.bidManagerId) || ''}
                            >
                              {getBidManagerName(bid.bidManagerId) ||
                                'Not assigned'}
                            </div>
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            <div className="flex justify-end gap-2 items-center">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                title="View Bid Details"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewBid(bid);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View</span>
                              </Button>
                              {canEditBids(bid) && (
                                <>
                                  {/* <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditBid(bid);
                                    }}
                                    title="Edit Bid"
                                  >
                                    <FileEdit className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                  </Button> */}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteClick(bid);
                                    }}
                                    title="Delete Bid"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete</span>
                                  </Button>
                                </>
                              )}
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
                  onValueChange={(value) => {
                    setItemsPerPage(Number.parseInt(value));
                    setCurrentPage(1);
                  }}
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
                <span className="text-sm text-muted-foreground">
                  Showing{' '}
                  {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}{' '}
                  to {Math.min(currentPage * itemsPerPage, totalItems)} of{' '}
                  {totalItems} results
                </span>
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
          </>
        )
      )}

      {/* Award Groups Section */}
      <div className="space-y-4 mt-8">
        {/* Page title and search */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold">Award Groups</h2>
            <p className="text-muted-foreground">
              Manage award groups across all bids
            </p>
          </div>

          <div className="flex gap-2">
            {canEditBids() && (
              <Button onClick={handleAddAwardGroup}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Award Group
              </Button>
            )}
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
                          {canEditBids() && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                onClick={() => handleEditAwardGroup(group.name)}
                                title="Edit Award Group"
                              >
                                <FileEdit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() =>
                                  handleDeleteAwardGroup(group.name)
                                }
                                title="Delete Award Group"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </>
                          )}
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

      {/* Create Bid Modal */}
      {createModalOpen && (
        <CreateBidModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          onSubmit={handleCreateBid}
          isLoading={isCreatingBid}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <ConfirmationModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          isLoading={isDeleteBidPending}
          title="Delete Bid"
          description={`Are you sure you want to delete bid ${selectedBid?.id}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
        />
      )}

      {/* Filters Modal */}
      {filtersModalOpen && (
        <BidFiltersModal
          isOpen={filtersModalOpen}
          onClose={() => setFiltersModalOpen(false)}
          filters={{
            year: filters.year,
            status: [filters.status],
            awardType: filters.awardType,
            myBids: filters.myBids,
          }}
          onApplyFilters={handleApplyFilters}
          bidYears={bidYears}
          availableStatuses={availableStatuses}
          isManager={isBidManager()}
        />
      )}

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
        allItems={mockBidItems}
        selectedItemIds={selectedAwardGroupItems.map((item) => item.id)}
        isEdit={isEditAwardGroup}
      />
    </div>
  );
}

export default function BidsPage() {
  return <BidsContent />;
}

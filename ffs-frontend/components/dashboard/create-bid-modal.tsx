'use client';

import type React from 'react';

import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { User as UserType } from '@/types/user';

interface CreateBidModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (bid: any) => void;
  isLoading?: boolean;
}

// Component for required field label
const RequiredLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center">
    {children}
    <span className="text-red-500 ml-1">*</span>
  </div>
);

// Custom searchable dropdown component
interface SearchableDropdownProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: { id: string; name: string }[];
  placeholder: string;
  required?: boolean;
  className?: string;
}

const SearchableDropdown = ({
  id,
  value,
  onChange,
  options,
  placeholder,
  required,
  className,
}: SearchableDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find((option) => option.id === value);

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      <div
        className="flex items-center justify-between border rounded-md px-3 py-2 bg-background h-10 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex-1 truncate text-sm">
          {selectedOption ? selectedOption.name : placeholder}
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-background shadow-lg rounded-md border overflow-hidden">
          <div className="p-2">
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="h-8 text-sm"
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>
          <div className="max-h-60 overflow-auto">
            <div className="py-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option.id}
                    className={cn(
                      'px-3 py-2 cursor-pointer text-sm',
                      option.id === value ? 'bg-accent' : 'hover:bg-accent'
                    )}
                    onClick={() => {
                      onChange(option.id);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                  >
                    {option.name}
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                  No options found
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export function CreateBidModal({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: CreateBidModalProps) {
  // Get current user and organization info
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [currentUserOrganizations, setCurrentUserOrganizations] = useState<
    string[]
  >([]);

  // Load current user data and extract organizations
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser) as UserType;
        setCurrentUser(user);

        // Extract organization IDs from user's roles
        const orgIds = new Set<string>();

        // Add from regular roles
        user.roles?.forEach((role) => {
          if (role.scope?.id) {
            orgIds.add(role.scope.id);
          }
        });

        // Add from bid roles
        user.bidRoles?.forEach((role) => {
          if (role.scope?.id) {
            orgIds.add(role.scope.id);
          }
        });

        const organizations = Array.from(orgIds);
        setCurrentUserOrganizations(organizations);

        console.log('Current user:', user);
        console.log('User organizations:', organizations);
      }
    } catch (error) {
      console.error('Error getting current user:', error);
    }
  }, []);

  // Generate school year options (previous, current, next)
  const schoolYearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [
      {
        id: `${currentYear - 1}-${currentYear}`,
        name: `${currentYear - 1}-${currentYear}`,
      },
      {
        id: `${currentYear}-${currentYear + 1}`,
        name: `${currentYear}-${currentYear + 1}`,
      },
      {
        id: `${currentYear + 1}-${currentYear + 2}`,
        name: `${currentYear + 1}-${currentYear + 2}`,
      },
    ];
  }, []);

  const [bidData, setBidData] = useState({
    name: '',
    note: '',
    bidYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`, // Default to current year
    category: '',
    status: 'In Process',
    awardType: 'Line Item',
    startDate: null as Date | null,
    endDate: null as Date | null,
    anticipatedOpeningDate: null as Date | null,
    awardDate: null as Date | null,
    bidManager: '', // Will be set when current user loads
    estimatedValue: '',
  });

  // Set default bid manager when current user loads
  useEffect(() => {
    if (currentUser && !bidData.bidManager) {
      setBidData((prev) => ({
        ...prev,
        bidManager: currentUser.id,
      }));
    }
  }, [currentUser, bidData.bidManager]);

  // Load real data from APIs
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [categories, setBidCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load all required data from database
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load categories
        const categoriesResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/bid-categories`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          }
        );
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setBidCategories(categoriesData);
          console.log('Loaded categories:', categoriesData.length);
        } else {
          console.error('Failed to fetch categories');
        }

        // Load eligible bid managers
        const bidManagersResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/eligible-bid-managers`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          }
        );
        if (bidManagersResponse.ok) {
          const bidManagersData = await bidManagersResponse.json();
          setAllUsers(bidManagersData);
          console.log('Loaded eligible bid managers:', bidManagersData.length);
        } else {
          console.error('Failed to fetch eligible bid managers');
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleChange = (field: string, value: any) => {
    // If changing the name field and it's a category ID, also update the category field
    if (field === 'name') {
      const selectedCategory = categories.find((cat) => cat.id === value);
      if (selectedCategory) {
        setBidData({
          ...bidData,
          [field]: selectedCategory.name, // Store category name, not ID
          category: value, // Set category to the ID value
        });
        return;
      }
    }

    setBidData({ ...bidData, [field]: value });
  };

  // Update the form submission to use real UUIDs
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Find the selected user to verify
    const selectedUser = allUsers.find((user) => user.id == bidData.bidManager);
    console.log('Selected user object:', selectedUser);

    // Validate required fields
    if (!bidData.name) {
      alert('Please select a bid name');
      return;
    }
    if (!bidData.note) {
      alert('Please enter a short note');
      return;
    }
    if (!bidData.bidManager) {
      alert('Please select a bid manager');
      return;
    }
    if (!selectedUser) {
      alert('Selected bid manager is invalid');
      return;
    }
    if (!bidData.startDate) {
      alert('Please select a start date');
      return;
    }
    if (!bidData.endDate) {
      alert('Please select an end date');
      return;
    }
    if (!bidData.anticipatedOpeningDate) {
      alert('Please select an anticipated opening date');
      return;
    }
    if (!bidData.awardDate) {
      alert('Please select an award date');
      return;
    }

    // Get the primary organization for the bid (use the first one)
    const primaryOrganization = currentUserOrganizations[0] || '';

    // Submit with proper UUIDs
    const submitData = {
      name: bidData.name,
      note: bidData.note,
      bidYear: bidData.bidYear,
      categoryId: bidData.category,
      status: bidData.status,
      awardType: bidData.awardType,
      startDate: bidData.startDate,
      endDate: bidData.endDate,
      anticipatedOpeningDate: bidData.anticipatedOpeningDate,
      awardDate: bidData.awardDate,
      bidManagerId: Number(bidData.bidManager), // This should be a UUID
      estimatedValue: bidData.estimatedValue,
      organizationId: primaryOrganization,
      organizationType: 'district', // Default to district
    };

    onSubmit(submitData);
  };

  const userOptions = useMemo(() => {
    return allUsers.map((user) => ({
      id: user.id,
      name:
        `${user.firstName || user.first_name || ''} ${
          user.lastName || user.last_name || ''
        }`.trim() ||
        user.email ||
        'Unknown User',
    }));
  }, [allUsers]);

  // Use real bid categories from database
  const categoryOptions = useMemo(() => {
    return categories.map((category) => ({
      id: category.id,
      name: category.name,
    }));
  }, [categories]);

  // Bid status options
  const bidStatuses = [
    { id: 'In Process', name: 'In Process' },
    { id: 'Released', name: 'Released' },
    { id: 'Opened', name: 'Opened' },
    { id: 'Awarded', name: 'Awarded' },
    { id: 'Canceled', name: 'Canceled' },
    { id: 'Archived', name: 'Archived' },
  ];

  // Award type options
  const awardTypes = [
    { id: 'Line Item', name: 'Line Item' },
    { id: 'Bottom Line', name: 'Bottom Line' },
    { id: 'Market Basket', name: 'Market Basket' },
    { id: 'RFP', name: 'RFP' },
    { id: 'Item Group', name: 'Item Group' },
  ];

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[950px] max-w-[90vw] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Bid</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-8 w-8 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500">Loading form data...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[950px] max-w-[90vw] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Bid</DialogTitle>
        </DialogHeader>

        <form
          id="create-bid-form"
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {/* Basic Information */}
          <div>
            <h3 className="text-base font-medium mb-2">Basic Information</h3>
            <div className="space-y-3">
              {/* Bid Name - Full Width */}
              <div>
                <RequiredLabel>
                  <Label htmlFor="name">Bid Name</Label>
                </RequiredLabel>
                <SearchableDropdown
                  id="name"
                  value={bidData.name}
                  onChange={(value) => handleChange('name', value)}
                  options={categoryOptions}
                  placeholder="Select a bid category"
                  required
                  className="w-full"
                />
              </div>

              {/* Short Note - Full Width */}
              <div>
                <RequiredLabel>
                  <Label htmlFor="note">Short Note</Label>
                </RequiredLabel>
                <Input
                  id="note"
                  value={bidData.note}
                  onChange={(e) => handleChange('note', e.target.value)}
                  placeholder="Brief description"
                  required
                  className="w-full"
                />
              </div>

              {/* Two Column Layout for remaining fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <RequiredLabel>
                    <Label htmlFor="bidYear">Bid Year</Label>
                  </RequiredLabel>
                  <SearchableDropdown
                    id="bidYear"
                    value={bidData.bidYear}
                    onChange={(value) => handleChange('bidYear', value)}
                    options={schoolYearOptions}
                    placeholder="Select bid year"
                    required
                  />
                </div>

                <div>
                  <RequiredLabel>
                    <Label htmlFor="category">Category</Label>
                  </RequiredLabel>
                  <SearchableDropdown
                    id="category"
                    value={bidData.category}
                    onChange={(value) => handleChange('category', value)}
                    options={categoryOptions}
                    placeholder="Select a category"
                    required
                    className="opacity-50 pointer-events-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Category is automatically set based on Bid Name
                  </p>
                </div>

                <div>
                  <RequiredLabel>
                    <Label htmlFor="status">Status</Label>
                  </RequiredLabel>
                  <SearchableDropdown
                    id="status"
                    value={bidData.status}
                    onChange={(value) => handleChange('status', value)}
                    options={bidStatuses}
                    placeholder="Select a status"
                    required
                  />
                </div>

                <div>
                  <RequiredLabel>
                    <Label htmlFor="awardType">Award Type</Label>
                  </RequiredLabel>
                  <SearchableDropdown
                    id="awardType"
                    value={bidData.awardType}
                    onChange={(value) => handleChange('awardType', value)}
                    options={awardTypes}
                    placeholder="Select an award type"
                    required
                  />
                </div>

                <div>
                  <RequiredLabel>
                    <Label htmlFor="estimatedValue">Estimated Value</Label>
                  </RequiredLabel>
                  <Input
                    id="estimatedValue"
                    value={bidData.estimatedValue}
                    onChange={(e) =>
                      handleChange('estimatedValue', e.target.value)
                    }
                    placeholder="e.g., $250,000"
                    required
                  />
                </div>

                <div>
                  <RequiredLabel>
                    <Label htmlFor="bidManager">Bid Manager</Label>
                  </RequiredLabel>
                  <SearchableDropdown
                    id="bidManager"
                    value={bidData.bidManager}
                    onChange={(value) => {
                      console.log('Bid manager changed to:', value);
                      handleChange('bidManager', value);
                    }}
                    options={userOptions}
                    placeholder="Select a bid manager"
                    required
                  />
                  {allUsers.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">
                      No eligible bid managers found.
                    </p>
                  )}
                  {allUsers.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Showing {allUsers.length} eligible bid managers
                    </p>
                  )}
                  {bidData.bidManager && (
                    <p className="text-xs text-blue-600 mt-1">
                      Selected: {bidData.bidManager}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div>
            <h3 className="text-base font-medium mb-2">Important Dates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <RequiredLabel>
                  <Label>Start Date</Label>
                </RequiredLabel>
                <DatePicker
                  date={bidData.startDate}
                  onDateChange={(date) => handleChange('startDate', date)}
                  placeholder="Select start date"
                  className="h-10 text-sm"
                />
              </div>

              <div>
                <RequiredLabel>
                  <Label>End Date</Label>
                </RequiredLabel>
                <DatePicker
                  date={bidData.endDate}
                  onDateChange={(date) => handleChange('endDate', date)}
                  placeholder="Select end date"
                  className="h-10 text-sm"
                />
              </div>

              <div>
                <RequiredLabel>
                  <Label>Anticipated Opening Date</Label>
                </RequiredLabel>
                <DatePicker
                  date={bidData.anticipatedOpeningDate}
                  onDateChange={(date) =>
                    handleChange('anticipatedOpeningDate', date)
                  }
                  placeholder="Select opening date"
                  className="h-10 text-sm"
                />
              </div>

              <div>
                <RequiredLabel>
                  <Label>Award Date</Label>
                </RequiredLabel>
                <DatePicker
                  date={bidData.awardDate}
                  onDateChange={(date) => handleChange('awardDate', date)}
                  placeholder="Select award date"
                  className="h-10 text-sm"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2 border-t mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                !bidData.bidManager || allUsers.length === 0 || isLoading
              }
            >
              Create Bid
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

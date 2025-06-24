'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  FileEdit,
  Save,
  X,
  Plus,
  Search,
  Filter,
  Trash2,
  ArrowLeft,
  ClipboardList,
  FileText,
  School,
  Building,
  Settings,
  AlertTriangle,
  ChevronRight,
  FileUp,
  CheckSquare,
  Video,
  ChevronDown,
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/toast-context';
import { DatePicker } from '@/components/ui/date-picker';
import { AddCommitteeMemberModal } from '@/components/dashboard/add-committee-member-modal';
import { EditCommitteeMemberModal } from '@/components/dashboard/edit-committee-member-modal';
import { BidSpecificationsPreview } from '@/components/dashboard/bid-specifications-preview';
import type { User } from '@/types/user';
import { cn } from '@/lib/utils';
import type { BidDetailsResponse, UpdateBidRequest } from '@/types/bid';
import { useApiQuery, usePatchMutation } from '@/hooks/use-api';
import type { DistrictResponse } from '@/types/district';
import type { BidCategory } from '@/types/bid-category';
import dayjs from 'dayjs';
import type { LoginResponseUser, Meta } from '@/types/auth';
import { AxiosError } from 'axios';

// Zod schema for bid form validation
const BidFormSchema = z.object({
  name: z.string().min(1, 'Bid name is required'),
  code: z.string().min(1, 'Bid number is required'),
  note: z.string().optional(),
  bidYear: z.string().min(4, 'Bid year must be at least 4 characters'),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  releaseDate: z.date().optional(),
  anticipatedOpeningDate: z.date().optional(),
  awardDate: z.date().optional(),
  status: z.enum([
    'In Process',
    'Released',
    'Opened',
    'Archived',
    'Awarded',
    'Canceled',
  ]),
  estimatedValue: z.coerce
    .number()
    .min(0, 'Estimated value must be positive')
    .optional(),
  bidManagerId: z.string().optional(),
});

type BidFormData = z.infer<typeof BidFormSchema>;

// Add this type definition
interface CommitteeMember {
  id: string;
  userId?: string;
  name: string;
  district: string;
  email: string;
  phone: string;
  bidId: string;
  isManager?: boolean;
}

// Custom searchable dropdown component
interface SearchableDropdownProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: { id: string; name: string }[];
  placeholder: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

const SearchableDropdown = ({
  id,
  value,
  onChange,
  options,
  placeholder,
  required,
  className,
  disabled = false,
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
        className={cn(
          'flex items-center justify-between border rounded-md px-3 py-2 bg-background h-10',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex-1 truncate text-sm">
          {selectedOption ? selectedOption.name : placeholder}
        </div>
        {!disabled && <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </div>

      {isOpen && !disabled && (
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

// Extend the CommitteeMember type to include isManager flag
type ExtendedCommitteeMember = CommitteeMember & {
  isManager?: boolean;
};

// Fetch bid categories from API or use mock data
const bidCategories = [
  {
    id: '1',
    name: 'Frozen',
    description:
      'Frozen food items including vegetables, meats, and prepared meals',
  },
  {
    id: '2',
    name: 'Bread',
    description: 'Bread products including sandwich bread, rolls, and buns',
  },
  { id: '3', name: 'Produce', description: 'Fresh fruits and vegetables' },
  {
    id: '4',
    name: 'Dairy',
    description: 'Milk, cheese, yogurt, and other dairy products',
  },
  { id: '5', name: 'Meat', description: 'Fresh and processed meat products' },
  {
    id: '6',
    name: 'Grocery',
    description: 'Shelf-stable food items and pantry staples',
  },
  {
    id: '7',
    name: 'Paper',
    description: 'Paper products including napkins, plates, and towels',
  },
  {
    id: '8',
    name: 'Cleaning',
    description: 'Cleaning supplies and janitorial products',
  },
];

// Bid status options
const bidStatuses = [
  'In Process',
  'Released',
  'Opened',
  'Archived',
  'Awarded',
  'Canceled',
] as const;

// Bid management options
const bidManagementOptions = [
  { id: 'items', label: 'Bid Items', icon: ClipboardList },
  { id: 'adjustments', label: 'Adjustments', icon: Settings },
  { id: 'districts', label: 'Participating Districts', icon: Building },
  { id: 'schools', label: 'Participating Schools', icon: School },
  { id: 'specifications', label: 'Bid Specifications', icon: FileText },
  { id: 'awarding', label: 'Awarding Instructions', icon: Video },
];

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

export default function BidDetails({ id }: { id: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState<LoginResponseUser | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [activeBidSection, setActiveBidSection] = useState('awarding');
  //   const { updateBid } = useBidMutations();

  const {
    data: bid,
    isLoading,
    refetch,
  } = useApiQuery<BidDetailsResponse>(`/bids/${id}`, ['bids', id]);

  const { mutate: updateBid, isPending: isUpdateBidPending } = usePatchMutation<
    Partial<UpdateBidRequest>,
    Meta
  >('/bids', {
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Bid has been updated successfully.',
        variant: 'success',
      });
      refetch();
      setIsEditing(false);
    },
    onError: (error: AxiosError<Meta>) => {
      toast({
        title: 'Error',
        description: `${
          error?.response?.data?.error || 'Failed to update bid'
        }`,
        variant: 'destructive',
      });
    },
    enabled: !!bid?.id,
  });

  // React Hook Form setup
  const form = useForm<BidFormData>({
    resolver: zodResolver(BidFormSchema),
    defaultValues: {
      name: bid?.name || '',
      code: bid?.code || '',
      note: bid?.note || '',
      bidYear: bid?.bidYear || '',
      startDate: bid?.startDate || undefined,
      endDate: bid?.endDate || undefined,
      releaseDate: bid?.releaseDate || undefined,
      anticipatedOpeningDate: bid?.anticipatedOpeningDate || undefined,
      awardDate: bid?.awardDate || undefined,
      status:
        (bid?.status as
          | 'In Process'
          | 'Released'
          | 'Opened'
          | 'Archived'
          | 'Awarded'
          | 'Canceled') || undefined,
      estimatedValue: Number(bid?.estimatedValue) || 0,
      bidManagerId: bid?.bidManagerId || '',
    },
  });

  const { data: district } = useApiQuery<DistrictResponse>(
    `/district/${bid?.districtId}`,
    ['district', bid?.districtId?.toString() || ''],
    {
      enabled: !!bid?.districtId,
    }
  );

  const { data: user } = useApiQuery<LoginResponseUser>(
    `/users/${bid?.bidManagerId}`,
    ['users', bid?.bidManagerId?.toString() || ''],
    {
      enabled: !!bid?.bidManagerId,
    }
  );

  const { data: category } = useApiQuery<BidCategory>(
    `/bid-categories/${bid?.categoryId}`,
    ['bid-categories', bid?.categoryId?.toString() || ''],
    {
      enabled: !!bid?.categoryId,
    }
  );

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as LoginResponseUser;
        setUserData(parsedUser);
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    }
  }, [id]);

  // Update form when bid data changes
  useEffect(() => {
    if (bid) {
      form.reset({
        name: bid.name || '',
        code: bid.code || '',
        note: bid.note || '',
        bidYear: bid.bidYear || '',
        startDate: bid.startDate ? new Date(bid.startDate) : undefined,
        endDate: bid.endDate ? new Date(bid.endDate) : undefined,
        releaseDate: bid.releaseDate ? new Date(bid.releaseDate) : undefined,
        anticipatedOpeningDate: bid.anticipatedOpeningDate
          ? new Date(bid.anticipatedOpeningDate)
          : undefined,
        awardDate: bid.awardDate ? new Date(bid.awardDate) : undefined,
        status:
          (bid.status as
            | 'In Process'
            | 'Released'
            | 'Opened'
            | 'Archived'
            | 'Awarded'
            | 'Canceled') || undefined,
        estimatedValue: Number(bid.estimatedValue) || 0,
        bidManagerId: bid.bidManagerId || '',
      });
    }
  }, [bid, form, isEditing]);

  // Bid Team Members state
  const [committeeMembers, setCommitteeMembers] = useState<
    ExtendedCommitteeMember[]
  >([]);
  const [filteredMembers, setFilteredMembers] = useState<
    ExtendedCommitteeMember[]
  >([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [editMemberModalOpen, setEditMemberModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] =
    useState<ExtendedCommitteeMember | null>(null);

  // Bid Specifications Preview state
  const [bidSpecsPreviewOpen, setBidSpecsPreviewOpen] = useState(false);

  // Check if user can edit bids
  const canEditBid = (): boolean => {
    if (!userData) return false;

    // Administrator can always edit
    if (
      userData.roles.some(
        (role) => role.type === 'Group Admin' || role.type === 'District Admin'
      )
    )
      return true;

    // Bid Administrator with specific permissions
    if (
      userData.bidRoles &&
      userData.bidRoles.some(
        (role) =>
          role.type === 'Bid Administrator' &&
          role.permissions.map((permission) => permission.name === 'edit_bids')
      )
    )
      return true;

    return false;
  };

  const handleSaveChanges = async (data: BidFormData) => {
    if (!bid?.id) return;

    const updateData = {
      ...data,
      estimatedValue: data.estimatedValue?.toString(),
    };

    updateBid({
      id: bid.id.toString(),
      data: updateData,
    });
  };

  const handleCancelEdit = () => {
    // Reset form to original values
    if (bid) {
      form.reset({
        name: bid.name || '',
        code: bid.code || '',
        note: bid.note || '',
        bidYear: bid.bidYear || '',
        startDate: bid.startDate ? new Date(bid.startDate) : undefined,
        endDate: bid.endDate ? new Date(bid.endDate) : undefined,
        releaseDate: bid.releaseDate ? new Date(bid.releaseDate) : undefined,
        anticipatedOpeningDate: bid.anticipatedOpeningDate
          ? new Date(bid.anticipatedOpeningDate)
          : undefined,
        awardDate: bid.awardDate ? new Date(bid.awardDate) : undefined,
        status: bid.status as any,
        estimatedValue: Number(bid.estimatedValue) || 0,
        bidManagerId: bid.bidManagerId || '',
      });
    }
    setIsEditing(false);
  };

  // Bid Team Member functions
  const handleAddMember = (newMember: CommitteeMember) => {
    setCommitteeMembers((prev) => [...prev, newMember]);
  };

  const handleEditMember = (member: CommitteeMember) => {
    setSelectedMember(member);
    setEditMemberModalOpen(true);
  };

  const handleUpdateMember = (updatedMember: CommitteeMember) => {
    setCommitteeMembers((prev) =>
      prev.map((member) =>
        member.id === updatedMember.id ? updatedMember : member
      )
    );
  };

  const handleDeleteMember = async (memberId: string) => {
    const memberToDelete = committeeMembers.find((m) => m.id === memberId);
    if (!memberToDelete || memberToDelete.isManager) return;

    try {
      const response = await fetch(`/api/committee-members/${memberId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete committee member');
      }

      // Update local state
      setCommitteeMembers((prev) =>
        prev.filter((member) => member.id !== memberId)
      );

      toast({
        title: 'Team Member Removed',
        description: `${memberToDelete.name} has been removed from the team.`,
        variant: 'success',
      });
    } catch (error) {
      console.error('Error deleting committee member:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove team member. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Navigate to reports page with bid filter
  const handleViewBidDocuments = () => {
    // Navigate to reports page with bid ID as a query parameter for filtering
    router.push(`/dashboard/reports?bidId=${bid?.id}`);
  };

  // Helper function to format date
  const formatDate = (date: Date | null) => {
    if (!date) return 'Not set';
    return format(new Date(date), 'MMMM d, yyyy');
  };

  // Helper function to format date and time
  const formatDateTime = (date: Date | null) => {
    if (!date) return 'Not set';
    return format(new Date(date), "MMMM d, yyyy 'at' h:mm a");
  };

  // Handle bid section navigation
  const handleBidSectionChange = (section: string) => {
    if (section === 'edit') {
      setIsEditing(true);
    } else if (section === 'items') {
      // Navigate to the Manage Bid Items page
      router.push(`/dashboard/bids/${id}/items`);
    } else if (section === 'documents') {
      // Navigate to the Reports page with bid filter
      handleViewBidDocuments();
    } else if (section === 'districts') {
      // Navigate to the Participating Districts page
      router.push(`/dashboard/bids/${id}/districts`);
    } else if (section === 'schools') {
      // Navigate to the Participating Schools page
      router.push(`/dashboard/bids/${id}/schools`);
    } else if (section === 'adjustments') {
      // Navigate to the Bid Adjustments page
      router.push(`/dashboard/bids/${id}/adjustments`);
    } else if (section === 'specifications') {
      // Open the Bid Specifications preview
      setBidSpecsPreviewOpen(true);
    } else {
      setActiveBidSection(section);
      // In a real app, you might load different data based on the section
      toast({
        title: 'Section Changed',
        description: `Navigated to ${section} section`,
        variant: 'default',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!bid) {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/bids/all')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Bids
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h2 className="text-xl font-semibold text-gray-700">
              Bid Not Found
            </h2>
            <p className="text-muted-foreground mt-2">
              The requested bid could not be found.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-2">
            <li className="inline-flex items-center">
              <Link
                href="/dashboard/bids/all"
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <ClipboardList className="w-4 h-4 mr-2" />
                Bids
              </Link>
            </li>

            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                  {bid.name || `${bid.bidYear} ${category?.name}`}
                </span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      {bid && (
        <div className="space-y-4">
          {/* Bid title and actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">
                {bid.name || `${bid.bidYear} ${category?.name}`}
              </h1>
              <Badge
                variant="outline"
                className={
                  statusColors[bid.status as keyof typeof statusColors] ||
                  'bg-gray-100 text-gray-800'
                }
              >
                {bid.status}
              </Badge>
            </div>

            <div className="flex items-center gap-3 mt-3 sm:mt-0">
              {isEditing && (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleCancelEdit}>
                    <X className="mr-2 h-4 w-4" /> Cancel
                  </Button>
                  <Button
                    onClick={form.handleSubmit(handleSaveChanges)}
                    disabled={isUpdateBidPending}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isUpdateBidPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Bid Management Options */}
          {canEditBid() && !isEditing && (
            <div className="mb-4 border-b pb-4">
              <div className="flex flex-wrap gap-2">
                {bidManagementOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <Button
                      key={option.id}
                      variant="outline"
                      size="sm"
                      className={cn(
                        'text-xs h-8 px-2 text-gray-700 border-gray-200 hover:bg-gray-50 hover:text-gray-900',
                        option.id === activeBidSection
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : ''
                      )}
                      onClick={() => handleBidSectionChange(option.id)}
                    >
                      <Icon className="h-3.5 w-3.5 mr-1" />
                      {option.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSaveChanges)}
              className="space-y-6"
            >
              {/* Bid Details Section */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Bid Details</h2>
                  {canEditBid() && !isEditing && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleBidSectionChange('edit')}
                        type="button"
                      >
                        <FileEdit className="h-4 w-4 mr-1" /> Edit Bid
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleBidSectionChange('documents')}
                        type="button"
                      >
                        <FileUp className="h-4 w-4 mr-1" /> View Reports
                      </Button>
                    </div>
                  )}
                </div>

                {/* Main content grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left column */}
                  <div className="space-y-6">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">
                          Bid Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <table className="w-full">
                          <tbody>
                            <tr className="border-b">
                              <td className="py-3 px-4 bg-gray-50 font-medium">
                                Bid Name
                              </td>
                              <td className="py-3 px-4">
                                {isEditing ? (
                                  <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormControl>
                                          <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                ) : (
                                  bid.name || category?.name
                                )}
                              </td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-3 px-4 bg-gray-50 font-medium">
                                Bid Number
                              </td>
                              <td className="py-3 px-4">
                                {isEditing ? (
                                  <FormField
                                    control={form.control}
                                    name="code"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormControl>
                                          <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                ) : (
                                  bid.code || bid.id
                                )}
                              </td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-3 px-4 bg-gray-50 font-medium">
                                Note
                              </td>
                              <td className="py-3 px-4">
                                {isEditing ? (
                                  <FormField
                                    control={form.control}
                                    name="note"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormControl>
                                          <Textarea {...field} rows={2} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                ) : (
                                  bid.note || 'No notes'
                                )}
                              </td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-3 px-4 bg-gray-50 font-medium">
                                Bid Year
                              </td>
                              <td className="py-3 px-4">
                                {isEditing ? (
                                  <FormField
                                    control={form.control}
                                    name="bidYear"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormControl>
                                          <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                ) : (
                                  bid.bidYear
                                )}
                              </td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-3 px-4 bg-gray-50 font-medium">
                                Start Date
                              </td>
                              <td className="py-3 px-4">
                                {isEditing ? (
                                  <FormField
                                    control={form.control}
                                    name="startDate"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormControl>
                                          <DatePicker
                                            date={field.value}
                                            onDateChange={field.onChange}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                ) : (
                                  dayjs(bid.startDate).format('MMMM D, YYYY')
                                )}
                              </td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-3 px-4 bg-gray-50 font-medium">
                                End Date
                              </td>
                              <td className="py-3 px-4">
                                {isEditing ? (
                                  <FormField
                                    control={form.control}
                                    name="endDate"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormControl>
                                          <DatePicker
                                            date={field.value}
                                            onDateChange={field.onChange}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                ) : (
                                  dayjs(bid.endDate).format('MMMM D, YYYY')
                                )}
                              </td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-3 px-4 bg-gray-50 font-medium">
                                Bid Release Date
                              </td>
                              <td className="py-3 px-4">
                                {isEditing ? (
                                  <FormField
                                    control={form.control}
                                    name="releaseDate"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormControl>
                                          <DatePicker
                                            date={field.value}
                                            onDateChange={field.onChange}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                ) : (
                                  formatDate(bid.releaseDate || null)
                                )}
                              </td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-3 px-4 bg-gray-50 font-medium">
                                Anticipated Opening Date
                              </td>
                              <td className="py-3 px-4">
                                {isEditing ? (
                                  <FormField
                                    control={form.control}
                                    name="anticipatedOpeningDate"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormControl>
                                          <DatePicker
                                            date={field.value}
                                            onDateChange={field.onChange}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                ) : (
                                  dayjs(bid.anticipatedOpeningDate).format(
                                    'MMMM D, YYYY'
                                  )
                                )}
                              </td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-3 px-4 bg-gray-50 font-medium">
                                Award Date
                              </td>
                              <td className="py-3 px-4">
                                {isEditing ? (
                                  <FormField
                                    control={form.control}
                                    name="awardDate"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormControl>
                                          <DatePicker
                                            date={field.value}
                                            onDateChange={field.onChange}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                ) : (
                                  dayjs(bid.awardDate).format('MMMM D, YYYY')
                                )}
                              </td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-3 px-4 bg-gray-50 font-medium">
                                Status
                              </td>
                              <td className="py-3 px-4">
                                {isEditing ? (
                                  <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormControl>
                                          <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                          >
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {bidStatuses.map((status) => (
                                                <SelectItem
                                                  key={status}
                                                  value={status}
                                                >
                                                  {status}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                ) : (
                                  bid.status
                                )}
                              </td>
                            </tr>
                            <tr>
                              <td className="py-3 px-4 bg-gray-50 font-medium">
                                Estimated Value
                              </td>
                              <td className="py-3 px-4">
                                {isEditing ? (
                                  <FormField
                                    control={form.control}
                                    name="estimatedValue"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormControl>
                                          <div className="flex items-center">
                                            <span className="mr-2">$</span>
                                            <Input
                                              type="number"
                                              {...field}
                                              onChange={(e) =>
                                                field.onChange(
                                                  Number(e.target.value)
                                                )
                                              }
                                            />
                                          </div>
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                ) : (
                                  `$${bid.estimatedValue}`
                                )}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right column */}
                  <div className="space-y-6">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">
                          Manager Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <table className="w-full">
                          <tbody>
                            <tr className="border-b">
                              <td className="py-3 px-4 bg-gray-50 font-medium">
                                Bid Manager
                              </td>
                              <td className="py-3 px-4">
                                {isEditing ? (
                                  <FormField
                                    control={form.control}
                                    name="bidManagerId"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormControl>
                                          <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                          >
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select bid manager" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {users.map((user) => (
                                                <SelectItem
                                                  key={user.id}
                                                  value={user.id}
                                                >
                                                  {user.firstName}{' '}
                                                  {user.lastName}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                ) : (
                                  user?.name || 'Not assigned'
                                )}
                              </td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-3 px-4 bg-gray-50 font-medium">
                                Manager District
                              </td>
                              <td className="py-3 px-4">
                                {district?.name || 'N/A'}
                              </td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-3 px-4 bg-gray-50 font-medium">
                                Manager Email
                              </td>
                              <td className="py-3 px-4">
                                <a
                                  href={`mailto:${user?.email}`}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  {user?.email}
                                </a>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </CardContent>
                    </Card>

                    {/* Manager Approvals Section */}
                    <Card className="mt-6">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">
                          Manager Approvals
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        {/* Action Required Banner - Only show if user is bid manager and there are pending items */}
                        {bid.bidManagerId === userData?.id &&
                          (bid.approvals?.termsAndConditions !== 'Approved' ||
                            bid.approvals?.requiredForms !== 'Approved' ||
                            bid.approvals?.bidItems !== 'Approved' ||
                            bid.approvals?.participatingDistricts !==
                              'Approved') && (
                            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4">
                              <div className="flex">
                                <div className="flex-shrink-0">
                                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm text-amber-700">
                                    <span className="font-medium">
                                      Action Required:
                                    </span>{' '}
                                    Please review and approve the pending items
                                    below.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                        {/* All Approvals Complete Message */}
                        {bid.approvals?.termsAndConditions === 'Approved' &&
                          bid.approvals?.requiredForms === 'Approved' &&
                          bid.approvals?.bidItems === 'Approved' &&
                          bid.approvals?.participatingDistricts ===
                            'Approved' && (
                            <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                              <div className="flex">
                                <div className="flex-shrink-0">
                                  <CheckSquare className="h-5 w-5 text-green-400" />
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm text-green-700">
                                    <span className="font-medium">
                                      All Set!
                                    </span>{' '}
                                    All required approvals have been completed.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                        <table className="w-full">
                          <tbody>
                            {/* Terms and Conditions */}
                            <tr className="border-b">
                              <td className="py-3 px-4 bg-gray-50 font-medium">
                                Terms and Conditions
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center justify-between">
                                  <Badge
                                    variant="outline"
                                    className={
                                      bid.approvals?.termsAndConditions ===
                                      'Approved'
                                        ? 'bg-green-50 text-green-700 border-green-200'
                                        : 'bg-amber-50 text-amber-700 border-amber-200'
                                    }
                                  >
                                    {bid.approvals?.termsAndConditions ||
                                      'Pending Approval'}
                                  </Badge>
                                  {bid.bidManagerId === userData?.id &&
                                    bid.approvals?.termsAndConditions !==
                                      'Approved' && (
                                      <button
                                        onClick={() => {
                                          toast({
                                            title: 'Approval Updated',
                                            description:
                                              'Terms and Conditions have been approved.',
                                            variant: 'success',
                                          });
                                        }}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                      >
                                        Approve
                                      </button>
                                    )}
                                </div>
                              </td>
                            </tr>

                            {/* Required Forms */}
                            <tr className="border-b">
                              <td className="py-3 px-4 bg-gray-50 font-medium">
                                Required Forms
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center justify-between">
                                  <Badge
                                    variant="outline"
                                    className={
                                      bid.approvals?.requiredForms ===
                                      'Approved'
                                        ? 'bg-green-50 text-green-700 border-green-200'
                                        : 'bg-amber-50 text-amber-700 border-amber-200'
                                    }
                                  >
                                    {bid.approvals?.requiredForms ||
                                      'Pending Approval'}
                                  </Badge>
                                  {bid.bidManagerId === userData?.id &&
                                    bid.approvals?.requiredForms !==
                                      'Approved' && (
                                      <button
                                        onClick={() => {
                                          toast({
                                            title: 'Approval Updated',
                                            description:
                                              'Required Forms have been approved.',
                                            variant: 'success',
                                          });
                                        }}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                      >
                                        Approve
                                      </button>
                                    )}
                                </div>
                              </td>
                            </tr>

                            {/* Bid Items */}
                            <tr className="border-b">
                              <td className="py-3 px-4 bg-gray-50 font-medium">
                                Bid Items
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center justify-between">
                                  <Badge
                                    variant="outline"
                                    className={
                                      bid.approvals?.bidItems === 'Approved'
                                        ? 'bg-green-50 text-green-700 border-green-200'
                                        : 'bg-amber-50 text-amber-700 border-amber-200'
                                    }
                                  >
                                    {bid.approvals?.bidItems ||
                                      'Pending Approval'}
                                  </Badge>
                                  {bid.bidManagerId === userData?.id &&
                                    bid.approvals?.bidItems !== 'Approved' && (
                                      <button
                                        onClick={() => {
                                          toast({
                                            title: 'Approval Updated',
                                            description:
                                              'Bid Items have been approved.',
                                            variant: 'success',
                                          });
                                        }}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                      >
                                        Approve
                                      </button>
                                    )}
                                </div>
                              </td>
                            </tr>

                            {/* Participating Districts */}
                            <tr>
                              <td className="py-3 px-4 bg-gray-50 font-medium">
                                Participating Districts
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center justify-between">
                                  <Badge
                                    variant="outline"
                                    className={
                                      bid.approvals?.participatingDistricts ===
                                      'Approved'
                                        ? 'bg-green-50 text-green-700 border-green-200'
                                        : 'bg-amber-50 text-amber-700 border-amber-200'
                                    }
                                  >
                                    {bid.approvals?.participatingDistricts ||
                                      'Pending Approval'}
                                  </Badge>
                                  {bid.bidManagerId === userData?.id &&
                                    bid.approvals?.participatingDistricts !==
                                      'Approved' && (
                                      <button
                                        onClick={() => {
                                          toast({
                                            title: 'Approval Updated',
                                            description:
                                              'Participating Districts have been approved.',
                                            variant: 'success',
                                          });
                                        }}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                      >
                                        Approve
                                      </button>
                                    )}
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </CardContent>
                    </Card>

                    {canEditBid() && bid.status === 'Awarded' && !isEditing && (
                      <Button
                        variant="outline"
                        type="button"
                        className="w-full"
                      >
                        <FileEdit className="mr-2 h-4 w-4" /> Edit Manager
                        Approvals
                      </Button>
                    )}
                  </div>
                </div>

                {/* Save Changes button at the bottom when in edit mode */}
                {isEditing && (
                  <div className="flex justify-end gap-4 mt-8">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelEdit}
                    >
                      <X className="mr-2 h-4 w-4" /> Cancel
                    </Button>
                    <Button type="submit" disabled={isUpdateBidPending}>
                      <Save className="mr-2 h-4 w-4" />
                      {isUpdateBidPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                )}
              </div>
            </form>
          </Form>

          {/* Bid Team Members Section */}
          <div className="pt-8 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-semibold">Bid Team Members</h2>
                {canEditBid() && (
                  <Button onClick={() => setAddMemberModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Team Member
                  </Button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search by keyword"
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  Showing {filteredMembers.length} of {committeeMembers.length}
                  <Button variant="ghost" size="sm" className="ml-2">
                    <Filter className="h-4 w-4 mr-1" /> Add filters
                  </Button>
                </div>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>District</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          {canEditBid() && (
                            <TableHead className="w-24">Actions</TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredMembers.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={canEditBid() ? 5 : 4}
                              className="text-center py-8 text-gray-500"
                            >
                              No team members found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredMembers.map((member) => (
                            <TableRow key={member.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  {member.name}
                                  {member.isManager && (
                                    <Badge
                                      variant="outline"
                                      className="ml-2 bg-orange-50 text-orange-700 border-orange-200"
                                    >
                                      Manager
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>{member.district}</TableCell>
                              <TableCell>
                                <a
                                  href={`mailto:${member.email}`}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  {member.email}
                                </a>
                              </TableCell>
                              <TableCell>
                                <a
                                  href={`tel:${member.phone}`}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  {member.phone}
                                </a>
                              </TableCell>
                              {canEditBid() && (
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2 items-center">
                                    {!member.isManager && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                        onClick={() =>
                                          handleDeleteMember(member.id)
                                        }
                                        title="Delete Member"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">Delete</span>
                                      </Button>
                                    )}
                                  </div>
                                </TableCell>
                              )}
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Add Team Member Modal */}
      <AddCommitteeMemberModal
        open={addMemberModalOpen}
        onOpenChange={setAddMemberModalOpen}
        bidId={bid?.id}
        onMemberAdded={handleAddMember}
      />

      {/* Edit Team Member Modal */}
      <EditCommitteeMemberModal
        open={editMemberModalOpen}
        onOpenChange={setEditMemberModalOpen}
        member={selectedMember}
        onMemberUpdated={handleUpdateMember}
      />

      {/* Bid Specifications Preview Modal */}
      <BidSpecificationsPreview
        isOpen={bidSpecsPreviewOpen}
        onClose={() => setBidSpecsPreviewOpen(false)}
        bidId={bid?.id}
      />
    </div>
  );
}

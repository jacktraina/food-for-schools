'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { mockDistricts } from '@/types/entities';
import { useApiQuery } from '@/hooks/use-api';
import { District } from '@/types/district';

export interface UserFilters {
  role: string;
  bidRole: string;
  status: string;
  district: string;
}

interface UserFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: UserFilters;
  onApplyFilters: (filters: UserFilters) => void;
}

export function UserFiltersModal({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
}: UserFiltersModalProps) {
  const [localFilters, setLocalFilters] = useState<UserFilters>({ ...filters });

  const { data: districts, isLoading: isLoadingGetDistricts } = useApiQuery<
    District[]
  >('/district', ['districts']);

  const handleReset = () => {
    setLocalFilters({
      role: 'all',
      bidRole: 'all',
      status: 'all', // changed from array
      district: 'all',
    });
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Filter Users</DialogTitle>
          <DialogDescription>
            Apply filters to narrow down the user list.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Role filter */}
          <div className="grid gap-2">
            <Label htmlFor="role-filter">Role</Label>
            <Select
              value={localFilters.role}
              onValueChange={(value) =>
                setLocalFilters({ ...localFilters, role: value })
              }
            >
              <SelectTrigger id="role-filter">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="Group Admin">Group Admin</SelectItem>
                <SelectItem value="District Admin">District Admin</SelectItem>
                <SelectItem value="School Admin">School Admin</SelectItem>
                <SelectItem value="Viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bid Role filter */}
          <div className="grid gap-2">
            <Label htmlFor="bid-role-filter">Bid Role</Label>
            <Select
              value={localFilters.bidRole}
              onValueChange={(value) =>
                setLocalFilters({ ...localFilters, bidRole: value })
              }
            >
              <SelectTrigger id="bid-role-filter">
                <SelectValue placeholder="Select bid role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Bid Roles</SelectItem>
                <SelectItem value="Bid Administrator">
                  Bid Administrator
                </SelectItem>
                <SelectItem value="Bid Viewer">Bid Viewer</SelectItem>
                <SelectItem value="None">None</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status filter */}
          <div className="grid gap-2">
            <Label htmlFor="status-filter">Status</Label>
            <Select
              value={localFilters.status}
              onValueChange={(value) =>
                setLocalFilters({ ...localFilters, status: value })
              }
            >
              <SelectTrigger id="status-filter">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* District filter */}
          <div className="grid gap-2">
            <Label htmlFor="district-filter">District</Label>
            <Select
              value={localFilters.district}
              onValueChange={(value) =>
                setLocalFilters({ ...localFilters, district: value })
              }
            >
              <SelectTrigger id="district-filter">
                <SelectValue placeholder="Select district" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Districts</SelectItem>
                {districts?.map((district) => (
                  <SelectItem key={district.id} value={district.id.toString()}>
                    {district.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button onClick={handleApply}>Apply Filters</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import type React from 'react';

import { useState, useEffect, useRef } from 'react';
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
import { useToast } from '@/components/ui/toast-context';
import { getFullName } from '@/types/user';
import { Search } from 'lucide-react';

interface AddCommitteeMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bidId: number;
  onMemberAdded: (member: any) => void;
}

export function AddCommitteeMemberModal({
  open,
  onOpenChange,
  bidId,
  onMemberAdded,
}: AddCommitteeMemberModalProps) {
  const { toast } = useToast();
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [existingMembers, setExistingMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    userId: '',
    name: '',
    district: '',
    email: '',
  });

  // Load available users and existing committee members
  useEffect(() => {
    const loadData = async () => {
      if (!open) return;

      try {
        // Load all users
        const usersResponse = await fetch('/api/users');
        const users = usersResponse.ok ? await usersResponse.json() : [];

        // Load existing committee members for this bid
        const membersResponse = await fetch(
          `/api/committee-members?bidId=${bidId}`
        );
        const members = membersResponse.ok ? await membersResponse.json() : [];

        setExistingMembers(members);

        // Filter out users who are already committee members
        const existingUserIds = members
          .map((member: any) => member.userId)
          .filter(Boolean);
        const filteredUsers = users.filter(
          (user: any) => !existingUserIds.includes(user.id)
        );

        setAvailableUsers(filteredUsers);
      } catch (error) {
        console.error('Failed to load data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load user data.',
          variant: 'destructive',
        });
      }
    };

    loadData();
  }, [bidId, open, toast]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleUserChange = (user: any) => {
    if (user) {
      // Extract district from user's roles - get the organization name from their role
      let district = 'Not specified';
      if (user.roles && user.roles.length > 0) {
        // Find the first role that has an organization name
        const roleWithOrg = user.roles.find((role: any) => role.scope?.name);
        if (roleWithOrg) {
          district = roleWithOrg.scope.name;
        }
      }

      setFormData({
        userId: user.id,
        name: getFullName(user),
        district: district,
        email: user.email,
      });
      setIsDropdownOpen(false);
      setSearchQuery('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form
      if (!formData.userId) {
        toast({
          title: 'Missing Information',
          description: 'Please select a user to add as committee member.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Create new committee member via API
      const response = await fetch('/api/committee-members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: formData.userId,
          name: formData.name,
          district: formData.district,
          email: formData.email,
          bidId: bidId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add committee member');
      }

      const newMember = await response.json();

      // Notify parent component
      onMemberAdded(newMember);

      // Reset form and close modal
      setFormData({
        userId: '',
        name: '',
        district: '',
        email: '',
      });
      onOpenChange(false);

      toast({
        title: 'Committee Member Added',
        description: `${newMember.name} has been added to the committee.`,
        variant: 'success',
      });
    } catch (error) {
      console.error('Error adding committee member:', error);
      toast({
        title: 'Error',
        description: 'Failed to add committee member. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search query
  const filteredUsers =
    searchQuery.trim() === ''
      ? availableUsers
      : availableUsers.filter(
          (user) =>
            getFullName(user)
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
        );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="user" className="text-right">
                User <span className="text-red-500">*</span>
              </Label>
              <div className="col-span-3 relative" ref={dropdownRef}>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search for a user..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    onClick={() => setIsDropdownOpen(true)}
                  />
                </div>

                {isDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-background shadow-lg rounded-md border overflow-hidden">
                    <div className="max-h-60 overflow-auto">
                      {filteredUsers.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                          No users found
                        </div>
                      ) : (
                        filteredUsers.map((user) => (
                          <div
                            key={user.id}
                            className="px-3 py-2 cursor-pointer text-sm hover:bg-accent"
                            onClick={() => handleUserChange(user)}
                          >
                            {getFullName(user)} ({user.email})
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {formData.userId && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    className="col-span-3"
                    disabled
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="district" className="text-right">
                    District
                  </Label>
                  <Input
                    id="district"
                    name="district"
                    value={formData.district}
                    className="col-span-3"
                    disabled
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    className="col-span-3"
                    disabled
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.userId || loading}>
              {loading ? 'Adding...' : 'Add Member'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

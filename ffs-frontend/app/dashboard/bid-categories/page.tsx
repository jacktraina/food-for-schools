'use client';

import React, { useState, useEffect } from 'react';
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
import { Edit, Trash2, Plus, Search } from 'lucide-react';
import { useToast } from '@/components/ui/toast-context';
import { Modal } from '@/components/Modal';
import { AddBidCategoryForm } from '@/components/dashboard/AddBidCategoryForm';
import { BidCategory } from '@/types/bid-category';
import {
  useApiQuery,
  usePutMutation,
  useDeleteMutation,
} from '@/hooks/use-api';

interface UserData {
  id: number;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  cooperativeId?: number;
  districtId?: number;
  roles?: Array<{
    type: string;
    scope: {
      id: number;
      type: string;
    };
    permissions: string[];
  }>;
  bidRoles?: Array<{
    type: string;
    scope: {
      id: number;
      type: string;
    };
    permissions: string[];
  }>;
  manageBids?: Array<{
    id: number;
    code: string;
  }>;
  status: string;
  lastLogin: string;
  demoAccount: boolean;
}

export default function CategoriesContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<BidCategory | null>(
    null
  );
  const [userData, setUserData] = useState<UserData | null>(null);
  const { toast } = useToast();

  const {
    data: categories = [],
    isLoading,
    refetch,
  } = useApiQuery<BidCategory[]>('/bid-categories', ['categories']);

  const updateCategoryMutation = usePutMutation<
    { name: string; description?: string },
    BidCategory
  >(`/bid-categories`, {
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Category updated successfully',
        variant: 'success',
      });
      setIsEditModalOpen(false);
      setSelectedCategory(null);
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to update category',
        variant: 'destructive',
      });
    },
  });

  const deleteCategoryMutation = useDeleteMutation('/bid-categories', {
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Category deleted successfully',
        variant: 'success',
      });
      setIsDeleteModalOpen(false);
      setSelectedCategory(null);
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to delete category',
        variant: 'destructive',
      });
    },
  });

  useEffect(() => {
    const storedUserData = localStorage.getItem('user');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, []);

  const canEditCategories = (): boolean => {
    if (!userData) return false;

    if (
      userData.roles?.some(
        (role: any) =>
          role.type === 'Group Admin' ||
          role.permissions?.includes('edit_all') ||
          role.permissions?.includes('manage_users')
      )
    ) {
      return true;
    }

    if (
      userData.bidRoles?.some(
        (role: any) =>
          role.type === 'Bid Administrator' ||
          role.permissions?.includes('manage_bid_users')
      )
    ) {
      return true;
    }

    return false;
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    refetch();
  };

  const handleEditCategory = (data: { name: string; description?: string }) => {
    if (!selectedCategory) return;
    updateCategoryMutation.mutate({
      id: selectedCategory.id.toString(),
      data: data,
    });
  };

  const handleDeleteCategory = () => {
    if (!selectedCategory) return;
    deleteCategoryMutation.mutate(selectedCategory.id.toString());
  };

  const openEditModal = (category: BidCategory) => {
    setSelectedCategory(category);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (category: BidCategory) => {
    setSelectedCategory(category);
    setIsDeleteModalOpen(true);
  };

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (category.description &&
        category.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading categories...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Bid Categories</h1>
        {canEditCategories() && (
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Category
          </Button>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Search className="w-4 h-4 text-gray-500" />
        <Input
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>External ID</TableHead>
              <TableHead>Description</TableHead>
              {canEditCategories() && (
                <TableHead className="w-[100px]">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>{category.external_id}</TableCell>
                <TableCell>
                  {category.description || 'No description'}
                </TableCell>
                {canEditCategories() && (
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(category)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteModal(category)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Modal
        title="Add New Category"
        description="Fill out the category details"
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      >
        <AddBidCategoryForm
          onSuccess={() => {
            setIsCreateModalOpen(false);
            refetch();
          }}
        />
      </Modal>

      {selectedCategory && (
        <Modal
          title="Edit Category"
          description="Update the category details"
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleEditCategory({
                name: formData.get('name') as string,
                description: formData.get('description') as string,
              });
            }}
            className="flex flex-col space-y-4"
          >
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Category Name
              </label>
              <Input
                id="name"
                name="name"
                defaultValue={selectedCategory.name}
                required
                placeholder="Enter category name"
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium mb-1"
              >
                Description
              </label>
              <Input
                id="description"
                name="description"
                defaultValue={selectedCategory.description || ''}
                placeholder="Enter category description (optional)"
              />
            </div>
            <div className="ml-auto">
              <Button type="submit" disabled={updateCategoryMutation.isPending}>
                Update
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {selectedCategory && (
        <Modal
          title="Delete Category"
          description={`Are you sure you want to delete "${selectedCategory.name}"? This action cannot be undone.`}
          open={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
        >
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCategory}
              disabled={deleteCategoryMutation.isPending}
            >
              Delete
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

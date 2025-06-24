'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Form, FormItem, FormLabel } from '@/components/ui/form';
import { PlusCircle } from 'lucide-react';
import {
  CreateBidItemSchema,
  type CreateBidItem,
} from '@/schemas/bidItemSchema';
import { FormSelectInput } from '../Form/FormSelectInput';
import { FormTextInput } from '../Form/FormTextInput';
import { FormTextAreaInput } from '../Form/FormTextAreaInput';
import { useApiQuery } from '@/hooks/use-api';
import { BidResponse } from '@/types/bid';

// Mock data for dropdowns
const awardGroups = [
  'Albies',
  'Bakecrafter',
  'Fresh Produce',
  'Dairy',
  'Paper Products',
  'Cleaning Supplies',
  'Grains',
  'Proteins',
];

const bidSubgroups = [
  'Breakfast Items',
  'Lunch Items',
  'Snacks',
  'Beverages',
  'Condiments',
  'Disposables',
  'Cleaning',
];

const projectionUnits = [
  'Case',
  'Each',
  'Pound',
  'Ounce',
  'Gallon',
  'Liter',
  'Serving',
  'Dozen',
  '50# Bag',
  '25# Bag',
  '10# Bag',
  '5# Bag',
  'Box',
  'Package',
  'Pallet',
  'Tray',
  'Flat',
  'Bunch',
  'Head',
  'Loaf',
  'Roll',
];

const bidUnits = [
  'EA',
  'CS',
  'LB',
  'OZ',
  'GAL',
  'L',
  'SVG',
  'DOZ',
  '50#',
  '25#',
  '10#',
  '5#',
  'BX',
  'PKG',
  'PLT',
  'TRY',
  'FLT',
  'BCH',
  'HD',
  'LF',
  'RL',
];

const statusOptions = ['Active', 'Inactive', 'Pending', 'Draft'];

interface AddBidItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: any) => void;
  bidId?: string;
  isLoading?: boolean;
  showBidSelection?: boolean;
}

export function AddBidItemModal({
  isOpen,
  onClose,
  onAdd,
  bidId,
  isLoading,
  showBidSelection = false,
}: AddBidItemModalProps) {
  const [showNewItemGroup, setShowNewItemGroup] = useState(false);
  const [newItemGroup, setNewItemGroup] = useState('');

  const { data: bids } = useApiQuery<BidResponse[]>(`/bids`, ['bids']);

  const form = useForm<CreateBidItem>({
    resolver: zodResolver(CreateBidItemSchema),
    defaultValues: {
      bidId: bidId ? Number(bidId) : undefined,
      itemName: '',
      awardGroup: '',
      projectionUnit: '',
      bidUnit: '',
      bidUnitProjUnit: 0,
      minProjection: undefined,
      status: 'Active',
      diversion: undefined,
      acceptableBrands: '',
      bidSpecification: '',
      projection: undefined,
      totalBidUnits: undefined,
      percentDistrictsUsing: undefined,
    },
  });

  const handleSubmit = (data: CreateBidItem) => {
    const newItem = {
      ...data,
      awardGroup: showNewItemGroup ? newItemGroup : data.awardGroup,
    };

    onAdd(newItem);
  };

  const resetForm = () => {
    form.reset({
      bidId: bidId ? Number(bidId) : undefined,
      itemName: '',
      awardGroup: '',
      projectionUnit: '',
      bidUnit: '',
      bidUnitProjUnit: 0,
      minProjection: undefined,
      status: 'Active',
      diversion: undefined,
      acceptableBrands: '',
      bidSpecification: '',
      projection: undefined,
      totalBidUnits: undefined,
      percentDistrictsUsing: undefined,
    });
    setShowNewItemGroup(false);
    setNewItemGroup('');
  };

  const handleAddNewItemGroup = () => {
    setShowNewItemGroup(true);
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add Bid Item</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              {/* Bid Selection - Only shown when opened from general Bid Items page */}
              {showBidSelection && (
                <div className="md:col-span-2">
                  <FormSelectInput
                    control={form.control}
                    name="bidId"
                    placeholder="Select a bid"
                    label="Select Bid *"
                    options={
                      bids?.map((bid) => ({
                        label: bid.name,
                        value: bid.id,
                      })) || []
                    }
                  />
                </div>
              )}

              {/* Item Name */}
              <div className="md:col-span-2">
                <FormTextInput
                  control={form.control}
                  name="itemName"
                  label="Item Name *"
                  placeholder="Enter item name"
                />
              </div>

              {/* Award Group */}
              {!showNewItemGroup ? (
                <div>
                  <FormSelectInput
                    control={form.control}
                    name="awardGroup"
                    label="Award Group"
                    placeholder="Select award group"
                    options={awardGroups.map((group) => ({
                      label: group,
                      value: group,
                    }))}
                    disabled={showNewItemGroup}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleAddNewItemGroup}
                    className="mt-2 text-sm"
                  >
                    <PlusCircle className="h-4 w-4 mr-1" /> New Award Group
                  </Button>
                </div>
              ) : (
                <FormItem>
                  <FormLabel className="text-sm font-light">
                    Award Group
                  </FormLabel>
                  <Input
                    value={newItemGroup}
                    onChange={(e) => setNewItemGroup(e.target.value)}
                    placeholder="Enter new award group"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNewItemGroup(false)}
                  >
                    Cancel
                  </Button>
                </FormItem>
              )}

              {/* Bid Subgroup - Not in schema but keeping for UI compatibility */}
              <FormItem>
                <FormLabel className="text-sm font-light">
                  Bid Subgroup
                </FormLabel>
                <Select>
                  <SelectTrigger className="bg-white w-full h-10">
                    <SelectValue placeholder="Select bid subgroup" />
                  </SelectTrigger>
                  <SelectContent>
                    {bidSubgroups.map((subgroup) => (
                      <SelectItem key={subgroup} value={subgroup}>
                        {subgroup}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>

              {/* Projection Unit */}
              <FormSelectInput
                control={form.control}
                name="projectionUnit"
                label="Projection Unit *"
                placeholder="Select projection unit"
                options={projectionUnits.map((unit) => ({
                  label: unit,
                  value: unit,
                }))}
              />

              {/* Bid Unit */}
              <FormSelectInput
                control={form.control}
                name="bidUnit"
                label="Bid Unit *"
                placeholder="Select bid unit"
                options={bidUnits.map((unit) => ({
                  label: unit,
                  value: unit,
                }))}
              />

              {/* Bid Unit/Proj. Unit */}
              <FormTextInput
                control={form.control}
                name="bidUnitProjUnit"
                label="Bid Unit/Proj. Unit *"
                type="number"
                min="0"
                placeholder="0.00"
              />

              {/* Minimum Projection */}
              <FormTextInput
                control={form.control}
                name="minProjection"
                label="Minimum Projection (projection units)"
                type="number"
                min="0"
                placeholder="0.00"
              />

              {/* Status */}
              <FormSelectInput
                control={form.control}
                name="status"
                label="Status"
                placeholder="Select status"
                options={statusOptions.map((status) => ({
                  label: status,
                  value: status,
                }))}
              />

              {/* Diversion */}
              <FormSelectInput
                control={form.control}
                name="diversion"
                label="Diversion"
                placeholder="Select diversion"
                options={[
                  { label: 'Yes', value: 'Yes' },
                  { label: 'No', value: 'No' },
                ]}
              />

              {/* Projection */}
              <FormTextInput
                control={form.control}
                name="projection"
                label="Projection"
                type="number"
                min="0"
                placeholder="0.00"
              />

              {/* Total Bid Units */}
              <FormTextInput
                control={form.control}
                name="totalBidUnits"
                label="Total Bid Units"
                type="number"
                min="0"
                placeholder="0.00"
              />

              {/* Percent Districts Using */}
              <FormTextInput
                control={form.control}
                name="percentDistrictsUsing"
                label="Percent Districts Using"
                type="number"
                min="0"
                max="100"
                placeholder="0.00"
              />

              {/* Acceptable Brands */}
              <div className="md:col-span-2">
                <FormTextAreaInput
                  control={form.control}
                  name="acceptableBrands"
                  label="Acceptable Brands"
                  placeholder="Enter comma-separated list of acceptable brands"
                  rows={2}
                />
              </div>
              {/* Bid Specification */}
              <div className="md:col-span-2">
                <FormTextAreaInput
                  control={form.control}
                  name="bidSpecification"
                  label="Bid Specification"
                  placeholder="Enter detailed bid specification requirements (e.g., quality standards, delivery requirements, packaging specifications...)"
                  rows={4}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleCancel}
                type="button"
                className="mr-2"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                Add Item
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form } from '@/components/ui/form';
import {
  CreateBidItemSchema,
  type CreateBidItem,
} from '@/schemas/bidItemSchema';
import type { BidItem } from '@/types/bid-item';
import { FormTextInput } from '../Form/FormTextInput';
import { FormSelectInput } from '../Form/FormSelectInput';
import { FormTextAreaInput } from '../Form/FormTextAreaInput';

const statusOptions = ['Active', 'Inactive', 'Pending', 'Draft'];
const diversionOptions = [
  { label: 'Yes', value: 'Yes' },
  { label: 'No', value: 'No' },
];

interface ViewBidItemModalProps {
  item: BidItem;
  isOpen: boolean;
  onClose: () => void;
  isEditMode?: boolean;
  isLoading?: boolean;
  onSave: (updatedItem: Partial<BidItem>) => void;
}

export function ViewBidItemModal({
  item,
  isOpen,
  onClose,
  isLoading,
  isEditMode = false,
  onSave,
}: ViewBidItemModalProps) {
  const form = useForm<CreateBidItem>({
    resolver: zodResolver(CreateBidItemSchema.optional()),
    defaultValues: {
      bidId: Number(item.bidId) || 0,
      itemName: item.itemName || '',
      awardGroup: item.awardGroup || '',
      projectionUnit: item.projectionUnit || '',
      bidUnit: item.bidUnit || '',
      bidUnitProjUnit: item.bidUnitProjUnit || 0,
      minProjection: item.minProjection || undefined,
      status: item.status || 'Active',
      diversion: item.diversion || undefined,
      acceptableBrands: item.acceptableBrands || '',
      //   bidSpecification: item.bidSpecification || '',
      projection: item.projection || undefined,
      totalBidUnits: item.totalBidUnits || undefined,
      percentDistrictsUsing: item.percentDistrictsUsing || undefined,
    },
  });

  useEffect(() => {
    if (item) {
      form.reset({
        bidId: Number(item.bidId) || 0,
        itemName: item.itemName || '',
        awardGroup: item.awardGroup || '',
        projectionUnit: item.projectionUnit || '',
        bidUnit: item.bidUnit || '',
        bidUnitProjUnit: item.bidUnitProjUnit || 0,
        minProjection: item.minProjection || undefined,
        status: item.status || 'Active',
        diversion: item.diversion || undefined,
        acceptableBrands: item.acceptableBrands || '',
        // bidSpecification: item.bidSpecification || '',
        projection: item.projection || undefined,
        totalBidUnits: item.totalBidUnits || undefined,
        percentDistrictsUsing: item.percentDistrictsUsing || undefined,
      });
    }
  }, [item, form]);

  if (!item) return null;

  const handleSave = (data: Partial<CreateBidItem>) => {
    onSave(data);
  };

  const handleCancel = () => {
    form.reset();
    onClose();
  };

  const title = isEditMode ? 'Edit Bid Item' : 'Bid Item Details';
  const description = isEditMode
    ? 'Edit the details for this bid item.'
    : 'View the complete details for this bid item.';

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
            <div className="grid gap-6 py-4">
              {/* Basic Information */}
              <div className="grid gap-4">
                <h3 className="text-base font-medium">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Item ID</label>
                    <Input value={item.id} readOnly className="bg-muted" />
                  </div>

                  {item.bidId && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Bid</label>
                      <Input
                        value={item.bidName || item.bidId}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                  )}

                  {isEditMode ? (
                    <FormTextInput
                      control={form.control}
                      name="awardGroup"
                      label="Award Group"
                      placeholder="Enter award group"
                    />
                  ) : (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Award Group</label>
                      <Input
                        value={item.awardGroup}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                  )}

                  {isEditMode ? (
                    <FormTextInput
                      control={form.control}
                      name="itemName"
                      label="Item Name"
                      placeholder="Enter item name"
                    />
                  ) : (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Item Name</label>
                      <Input
                        value={item.itemName}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                  )}

                  {isEditMode ? (
                    <FormSelectInput
                      control={form.control}
                      name="diversion"
                      label="Diversion"
                      placeholder="Select diversion status"
                      options={diversionOptions}
                    />
                  ) : (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Diversion</label>
                      <Input
                        value={item.diversion}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                  )}

                  {isEditMode ? (
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
                  ) : (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status</label>
                      <Input
                        value={item.status}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Projection Information */}
              <div className="grid gap-4">
                <h3 className="text-base font-medium">
                  Projection Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {isEditMode ? (
                    <FormTextInput
                      control={form.control}
                      name="projection"
                      label="Projection"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  ) : (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Projection</label>
                      <Input
                        value={item.projection}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                  )}

                  {isEditMode ? (
                    <FormTextInput
                      control={form.control}
                      name="projectionUnit"
                      label="Projection Unit"
                      placeholder="Enter projection unit"
                    />
                  ) : (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Projection Unit
                      </label>
                      <Input
                        value={item.projectionUnit}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                  )}

                  {isEditMode ? (
                    <FormTextInput
                      control={form.control}
                      name="minProjection"
                      label="Min. Projection"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  ) : (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Min. Projection
                      </label>
                      <Input
                        value={item.minProjection}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Bid Units Information */}
              <div className="grid gap-4">
                <h3 className="text-base font-medium">Bid Units Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {isEditMode ? (
                    <FormTextInput
                      control={form.control}
                      name="totalBidUnits"
                      label="Total Bid Units"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  ) : (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Total Bid Units
                      </label>
                      <Input
                        value={item.totalBidUnits?.toLocaleString()}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                  )}

                  {isEditMode ? (
                    <FormTextInput
                      control={form.control}
                      name="bidUnit"
                      label="Bid Unit"
                      placeholder="Enter bid unit"
                    />
                  ) : (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Bid Unit</label>
                      <Input
                        value={item.bidUnit}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                  )}

                  {isEditMode ? (
                    <FormTextInput
                      control={form.control}
                      name="bidUnitProjUnit"
                      label="Unit Ratio"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.0"
                    />
                  ) : (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Unit Ratio</label>
                      <Input
                        value={item.bidUnitProjUnit?.toFixed(1)}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              <div className="grid gap-4">
                <h3 className="text-base font-medium">
                  Additional Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {isEditMode ? (
                    <FormTextInput
                      control={form.control}
                      name="percentDistrictsUsing"
                      label="% Districts Using"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0.00"
                    />
                  ) : (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        % Districts Using
                      </label>
                      <Input
                        value={`${item.percentDistrictsUsing}%`}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                  )}
                </div>

                {isEditMode ? (
                  <FormTextAreaInput
                    control={form.control}
                    name="acceptableBrands"
                    label="Acceptable Brands"
                    placeholder="Enter comma-separated list of acceptable brands"
                    rows={2}
                  />
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Acceptable Brands
                    </label>
                    <Textarea
                      value={item.acceptableBrands}
                      readOnly
                      className="bg-muted"
                      rows={2}
                    />
                  </div>
                )}

                {/* {isEditMode ? (
                  <FormTextAreaInput
                    control={form.control}
                    name="bidSpecification"
                    label="Bid Specification"
                    placeholder="Enter detailed bid specification requirements..."
                    rows={6}
                  />
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Bid Specification
                    </label>
                    <Textarea
                      value={
                        item.bidSpecification || 'No specification provided'
                      }
                      readOnly
                      className="bg-muted"
                      rows={6}
                    />
                  </div>
                )} */}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCancel} type="button">
                {isEditMode ? 'Cancel' : 'Close'}
              </Button>
              {isEditMode && (
                <Button disabled={isLoading} type="submit">
                  Save Changes
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

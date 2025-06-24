'use client';

import { ConfirmationModal } from '@/components/ui/confirmation-modal';

interface DeleteBidItemConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  itemId: number;
}

export function DeleteBidItemConfirmation({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemId,
}: DeleteBidItemConfirmationProps) {
  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete Bid Item"
      description={`Are you sure you want to delete the bid item "${itemName}" (${itemId})? This action cannot be undone.`}
      confirmText="Delete"
      cancelText="Cancel"
    />
  );
}

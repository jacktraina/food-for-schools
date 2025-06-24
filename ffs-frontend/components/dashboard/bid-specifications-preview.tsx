'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import { mockBids } from '@/data/mock-bids';
import jsPDF from 'jspdf';

// Mock bid items with specifications
const mockBidItemsWithSpecs = [
  {
    id: 'BA11627',
    itemName: 'Bagels, 4 oz, Whole Grain, Plain',
    bidUnit: 'EA',
    groupProjection: 390408,
    bidSpecification:
      'Bagel must meet the whole grain-rich criteria, meaning they are 100 percent whole grain or contain a blend of whole grain ingredients and enriched grain ingredients (whole grain must account for at least 51 percent of the total grain ingredients by weight). Bagels are to be made fresh, and baked within sixteen hours of delivery. No preservatives are to be added. The net weight shall be a minimum of 4 oz. per bagel. Bagels shall be sliced and bagged.',
    acceptableBrands: 'Modern Italian 3701',
  },
  {
    id: 'BA12319',
    itemName: 'Bagels, mini 2 oz, Whole Grain, Plain',
    bidUnit: 'EA',
    groupProjection: 527388,
    bidSpecification:
      'Bagel must meet the whole grain-rich criteria, meaning they are 100 percent whole grain or contain a blend of whole grain ingredients and enriched grain ingredients (whole grain must account for at least 51 percent of the total grain ingredients by weight). Bagels are to be made fresh, and baked within sixteen hours of delivery. No preservatives are to be added. The net weight shall be a minimum of 2 oz. per bagel. Bagels shall be sliced and bagged.',
    acceptableBrands: 'Modern Italian 3701',
  },
  {
    id: 'BA14628',
    itemName: 'Bagels, 4 oz, Poppy',
    bidUnit: 'EA',
    groupProjection: 9384,
    bidSpecification:
      'Bagels are to be made fresh, and baked within sixteen hours of delivery. No preservatives are to be added. The net weight shall be a minimum of 4 oz. per bagel. Bagels shall be sliced and bagged.',
    acceptableBrands: 'Modern Italian 3701',
  },
  {
    id: 'BA14629',
    itemName: 'Bagels, 4 oz, Everything',
    bidUnit: 'EA',
    groupProjection: 9384,
    bidSpecification:
      'Bagels are to be made fresh, and baked within sixteen hours of delivery. No preservatives are to be added. The net weight shall be a minimum of 4 oz. per bagel. Bagels shall be sliced and bagged.',
    acceptableBrands: 'Modern Italian 3701',
  },
];

interface BidSpecificationsPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  bidId: number;
}

export function BidSpecificationsPreview({
  isOpen,
  onClose,
  bidId,
}: BidSpecificationsPreviewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(85);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 25, 25));
  };

  // Find the bid
  const bid = mockBids.find((b) => b.id === bidId);

  if (!bid) return null;

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'Not set';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDownload = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let currentY = 30;

    // Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Bid Specifications', pageWidth / 2, currentY, {
      align: 'center',
    });
    currentY += 15;

    // Subtitle
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const subtitle =
      'Vendors intending to submit items as alternate to Acceptable Items must follow the procedures outlined in the Terms and Conditions.';
    const subtitleLines = doc.splitTextToSize(subtitle, pageWidth - 40);
    doc.text(subtitleLines, pageWidth / 2, currentY, { align: 'center' });
    currentY += subtitleLines.length * 5 + 15;

    // Bid Information Table
    const tableData = [
      { label: 'Bid Name', value: bid.name || 'Fresh Produce Supply' },
      { label: 'Bid Number', value: bid.id },
      { label: 'Bid Year', value: bid.bidYear },
    ];

    const dateData = [
      { label: 'Start Date', value: formatDate(bid.startDate) },
      { label: 'End Date', value: formatDate(bid.endDate) },
    ];

    // Left column
    let leftY = currentY;
    tableData.forEach((row) => {
      doc.setFont('helvetica', 'bold');
      doc.text(row.label, 20, leftY);
      doc.setFont('helvetica', 'normal');
      doc.text(row.value, 60, leftY);
      leftY += 8;
    });

    // Right column
    let rightY = currentY;
    dateData.forEach((row) => {
      doc.setFont('helvetica', 'bold');
      doc.text(row.label, 120, rightY);
      doc.setFont('helvetica', 'normal');
      doc.text(row.value, 160, rightY);
      rightY += 8;
    });

    currentY = Math.max(leftY, rightY) + 15;

    // Bid Items
    mockBidItemsWithSpecs.forEach((item, index) => {
      // Check if we need a new page
      if (currentY > 220) {
        doc.addPage();
        currentY = 20;
      }

      // Item header
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Item ${index + 1}: ${item.itemName}`, 20, currentY);
      currentY += 12;

      // Item details in two columns
      const itemDetails = [
        { label: 'Item Name', value: item.itemName },
        { label: 'ID', value: item.id },
        { label: 'Bid Unit', value: item.bidUnit },
        {
          label: 'Group Projection',
          value: item.groupProjection.toLocaleString(),
        },
      ];

      let detailY = currentY;
      itemDetails.forEach((detail) => {
        // Left column
        doc.setFont('helvetica', 'bold');
        doc.text(detail.label, 20, detailY);
        doc.setFont('helvetica', 'normal');
        doc.text(detail.value, 70, detailY);

        // Right column (duplicate)
        doc.setFont('helvetica', 'bold');
        doc.text(detail.label, 120, detailY);
        doc.setFont('helvetica', 'normal');
        doc.text(detail.value, 170, detailY);

        detailY += 8;
      });

      currentY = detailY + 5;

      // Bid Specification
      doc.setFont('helvetica', 'bold');
      doc.text('Bid Specification', 20, currentY);
      currentY += 8;

      doc.setFont('helvetica', 'normal');
      const specLines = doc.splitTextToSize(
        item.bidSpecification,
        pageWidth - 40
      );
      doc.text(specLines, 20, currentY);
      currentY += specLines.length * 5 + 8;

      // Acceptable Brands
      doc.setFont('helvetica', 'bold');
      doc.text('Acceptable Brands', 20, currentY);
      doc.setFont('helvetica', 'normal');
      doc.text(item.acceptableBrands, 70, currentY);
      currentY += 15;
    });

    // Download the PDF
    doc.save(`${bid.name || bid.bidYear}-bid-specifications.pdf`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 flex flex-col [&>button]:hidden">
        <DialogHeader className="px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              bagelbidspecs2526.pdf
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* PDF Viewer Controls */}
        <div className="flex items-center justify-center gap-4 px-6 py-2 bg-gray-100 border-b text-sm">
          <span>1 / 3</span>
          <span>|</span>
          <span>{zoomLevel}%</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={handleZoomOut}
          >
            -
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={handleZoomIn}
          >
            +
          </Button>
        </div>

        {/* PDF Content - Now matches the downloaded version exactly */}
        <div
          className="flex-1 overflow-auto bg-gray-200 p-4"
          style={{ maxHeight: 'calc(95vh - 120px)' }}
        >
          <div
            className="max-w-4xl mx-auto bg-white shadow-lg mb-4 transition-transform duration-200 p-8"
            style={{
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top center',
            }}
          >
            {/* Title */}
            <div className="text-center mb-6">
              <h1 className="text-xl font-bold mb-4">Bid Specifications</h1>
              <p className="text-sm text-gray-700 mb-6 max-w-3xl mx-auto">
                Vendors intending to submit items as alternate to Acceptable
                Items must follow the procedures outlined in the Terms and
                Conditions.
              </p>
            </div>

            {/* Bid Information - Simple layout matching PDF */}
            <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
              <div className="space-y-2">
                <div className="flex">
                  <span className="font-bold w-24">Bid Name</span>
                  <span>{bid.name || 'Fresh Produce Supply'}</span>
                </div>
                <div className="flex">
                  <span className="font-bold w-24">Bid Number</span>
                  <span>{bid.id}</span>
                </div>
                <div className="flex">
                  <span className="font-bold w-24">Bid Year</span>
                  <span>{bid.bidYear}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex">
                  <span className="font-bold w-24">Start Date</span>
                  <span>{formatDate(bid.startDate)}</span>
                </div>
                <div className="flex">
                  <span className="font-bold w-24">End Date</span>
                  <span>{formatDate(bid.endDate)}</span>
                </div>
              </div>
            </div>

            {/* Bid Items */}
            <div className="space-y-6">
              {mockBidItemsWithSpecs.map((item, index) => (
                <div key={item.id} className="text-sm">
                  {/* Item header */}
                  <h3 className="text-base font-bold mb-3">{`Item ${
                    index + 1
                  }: ${item.itemName}`}</h3>

                  {/* Item details in two columns */}
                  <div className="grid grid-cols-2 gap-8 mb-4">
                    <div className="space-y-2">
                      <div className="flex">
                        <span className="font-bold w-32">Item Name</span>
                        <span>{item.itemName}</span>
                      </div>
                      <div className="flex">
                        <span className="font-bold w-32">ID</span>
                        <span>{item.id}</span>
                      </div>
                      <div className="flex">
                        <span className="font-bold w-32">Bid Unit</span>
                        <span>{item.bidUnit}</span>
                      </div>
                      <div className="flex">
                        <span className="font-bold w-32">Group Projection</span>
                        <span>{item.groupProjection.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex">
                        <span className="font-bold w-32">Item Name</span>
                        <span>{item.itemName}</span>
                      </div>
                      <div className="flex">
                        <span className="font-bold w-32">ID</span>
                        <span>{item.id}</span>
                      </div>
                      <div className="flex">
                        <span className="font-bold w-32">Bid Unit</span>
                        <span>{item.bidUnit}</span>
                      </div>
                      <div className="flex">
                        <span className="font-bold w-32">Group Projection</span>
                        <span>{item.groupProjection.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bid Specification */}
                  <div className="mb-2">
                    <span className="font-bold">Bid Specification</span>
                    <p className="mt-1 leading-relaxed">
                      {item.bidSpecification}
                    </p>
                  </div>

                  {/* Acceptable Brands */}
                  <div className="flex">
                    <span className="font-bold w-32">Acceptable Brands</span>
                    <span>{item.acceptableBrands}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

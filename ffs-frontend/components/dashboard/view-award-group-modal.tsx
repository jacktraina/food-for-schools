import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface ViewAwardGroupModalProps {
  isOpen: boolean
  onClose: () => void
  awardGroup: string
  items: any[]
}

export function ViewAwardGroupModal({ isOpen, onClose, awardGroup, items }: ViewAwardGroupModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Award Group: {awardGroup}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <div className="text-sm text-gray-500 mb-2">
            {items.length} {items.length === 1 ? "item" : "items"} in this award group
          </div>
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Item ID</TableHead>
                  <TableHead className="whitespace-nowrap">Item Name</TableHead>
                  <TableHead className="whitespace-nowrap">Status</TableHead>
                  <TableHead className="whitespace-nowrap">Diversion</TableHead>
                  <TableHead className="whitespace-nowrap">Projection</TableHead>
                  <TableHead className="whitespace-nowrap">Acceptable Brands</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="whitespace-nowrap">{item.id}</TableCell>
                    <TableCell className="whitespace-nowrap truncate" title={item.itemName}>
                      <div className="truncate max-w-[280px]">{item.itemName}</div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          item.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{item.diversion}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {item.projection} {item.projectionUnit}
                    </TableCell>
                    <TableCell className="whitespace-nowrap truncate" title={item.acceptableBrands}>
                      {item.acceptableBrands}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

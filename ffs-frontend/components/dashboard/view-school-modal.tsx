"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface ViewSchoolModalProps {
  school: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (() => void) | undefined
  readOnly?: boolean
}

export function ViewSchoolModal({ school, open, onOpenChange, onEdit, readOnly }: ViewSchoolModalProps) {
  if (!school) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{school.name}</DialogTitle>
          <DialogDescription>School information and details</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">School Name</h3>
              <p className="text-base">{school.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Enrollment</h3>
              <p className="text-base">{school.enrollment.toLocaleString()} students</p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Shipping Address</h3>
            <p className="text-base">{school.shippingAddress}</p>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium text-muted-foreground">School Contact</h3>
            <p className="text-base">{school.schoolContact}</p>
          </div>

          {school.notes && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                <p className="text-base">{school.notes}</p>
              </div>
            </>
          )}

          {school.overrideBillingInfo ? (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Billing Information (School-Specific)</h3>
                <div className="mt-2 space-y-2">
                  <div>
                    <span className="text-xs text-muted-foreground">Billing Contact:</span>
                    <p className="text-base">{school.billingContact || "Not specified"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Billing Address:</span>
                    <p className="text-base">{school.billingAddress || "Not specified"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Billing Phone:</span>
                    <p className="text-base">{school.billingPhone || "Not specified"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Billing Email:</span>
                    <p className="text-base">{school.billingEmail || "Not specified"}</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Billing Information</h3>
                <p className="text-base text-muted-foreground italic">Using district billing information</p>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {!readOnly && onEdit && <Button onClick={onEdit}>Edit School</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

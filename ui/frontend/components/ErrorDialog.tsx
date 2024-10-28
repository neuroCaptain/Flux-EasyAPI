'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ErrorDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  error: string | null
}

export function ErrorDialog({ isOpen, onOpenChange, error }: ErrorDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Error</DialogTitle>
          <DialogDescription>{error}</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle2, ShieldAlert, FileText, Send } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { submitComplaint } from '@/app/actions/compliance';
import type { ComplaintCategory } from '@/types';

interface ReportIssueDialogProps {
  orderId?: string;
  orderCode?: string;
  businessName?: string;
  triggerButton?: React.ReactNode;
}

export function ReportIssueDialog({
  orderId,
  orderCode,
  businessName,
  triggerButton,
}: ReportIssueDialogProps) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<ComplaintCategory>('food_safety');
  const [description, setDescription] = useState('');
  const [ticketResult, setTicketResult] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || description.trim().length < 10) {
      toast.error('Please describe your concern in at least 10 characters.');
      return;
    }

    startTransition(async () => {
      const result = await submitComplaint({
        category,
        description,
        orderId,
      });

      if (result.success && result.data) {
        setTicketResult(result.data.ticketNumber);
        toast.success(`Complaint registered: ${result.data.ticketNumber}`);
      } else {
        toast.error(result.error || 'Failed to submit concern');
      }
    });
  };

  const handleClose = () => {
    setOpen(false);
    setTicketResult(null);
    setDescription('');
  };

  return (
    <>
      <div onClick={() => setOpen(true)} className="cursor-pointer inline-flex">
        {triggerButton || (
          <Button type="button" variant="outline" size="sm" className="text-xs border-destructive/30 text-destructive hover:bg-destructive/10">
            <ShieldAlert className="size-3.5 mr-1.5" />
            Report an Issue / Safety Concern
          </Button>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
        {ticketResult ? (
          <div className="py-4 text-center space-y-4">
            <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <CheckCircle2 className="size-6" />
            </div>
            <div>
              <DialogTitle className="text-lg">Concern Submitted</DialogTitle>
              <DialogDescription className="text-xs mt-1">
                Your grievance has been logged in our compliance tracking system.
              </DialogDescription>
            </div>
            <div className="p-4 rounded-xl bg-muted/50 border font-mono text-sm space-y-1">
              <p className="text-xs text-muted-foreground font-sans">Ticket Reference</p>
              <p className="text-lg font-bold text-primary">{ticketResult}</p>
              <p className="text-[11px] text-muted-foreground font-sans mt-1">
                Our support desk reviews food-safety tickets within 2–4 hours.
              </p>
            </div>
            <DialogFooter>
              <Button className="w-full" onClick={handleClose}>
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="size-4 text-amber-600" />
                Report an Issue or Safety Concern
              </DialogTitle>
              <DialogDescription className="text-xs">
                {orderCode
                  ? `Reporting regarding Order ${orderCode} ${businessName ? `(${businessName})` : ''}`
                  : 'Submit a grievance regarding food quality, safety, or counter fulfillment.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-1">
              <div className="space-y-1.5">
                <Label htmlFor="issue-category" className="text-xs font-medium">
                  Issue Category *
                </Label>
                <select
                  id="issue-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="food_safety">🚨 Food Safety & Quality Concern (High Priority)</option>
                  <option value="order_issue">📦 Order / Store Fulfillment Issue</option>
                  <option value="refund_issue">💳 Refund or Price Discrepancy</option>
                  <option value="business_complaint">🏪 Merchant Counter Service Issue</option>
                  <option value="account_privacy">🔒 Data Privacy / Account Issue</option>
                  <option value="other">ℹ️ Other Inquiry</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="issue-desc" className="text-xs font-medium">
                  Detailed Description *
                </Label>
                <Textarea
                  id="issue-desc"
                  rows={4}
                  placeholder="Please describe what happened in detail (e.g. food temperature, off-odors, packaging defects, or store unavailability)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="text-sm"
                  required
                />
              </div>

              <p className="text-[11px] text-muted-foreground">
                All food-safety reports trigger an audit review under our{' '}
                <a href="/food-safety" target="_blank" className="text-primary underline">
                  Food Safety Policy
                </a>.
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Submitting...' : 'Submit Report'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}

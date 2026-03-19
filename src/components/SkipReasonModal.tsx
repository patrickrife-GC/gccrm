import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SKIP_REASONS = [
  "Wrong fit",
  "Already in CRM",
  "Not now — revisit later",
  "Bad data",
  "Other",
];

interface SkipReasonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prospectName: string;
  onConfirm: (reason: string) => void;
}

export function SkipReasonModal({
  open,
  onOpenChange,
  prospectName,
  onConfirm,
}: SkipReasonModalProps) {
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  const handleConfirm = () => {
    const full = notes ? `${reason}: ${notes}` : reason;
    onConfirm(full);
    setReason("");
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Skip {prospectName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger>
              <SelectValue placeholder="Select a reason…" />
            </SelectTrigger>
            <SelectContent>
              {SKIP_REASONS.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            placeholder="Optional notes…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!reason}>
            Confirm Skip
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

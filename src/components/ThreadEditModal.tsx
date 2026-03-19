import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Thread } from "@/lib/threadTypes";

interface ThreadEditModalProps {
  thread: Thread | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updates: Partial<Thread> & { id: string }) => void;
  isPending: boolean;
}

export function ThreadEditModal({ thread, open, onOpenChange, onSave, isPending }: ThreadEditModalProps) {
  const [status, setStatus] = useState("active");
  const [progress, setProgress] = useState(0);
  const [progressNote, setProgressNote] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (thread) {
      setStatus(thread.status);
      setProgress(thread.progress);
      setProgressNote(thread.progress_note ?? "");
      setNextAction(thread.next_action ?? "");
      setNotes(thread.notes ?? "");
    }
  }, [thread]);

  if (!thread) return null;

  const handleSave = () => {
    onSave({
      id: thread.id,
      status,
      progress,
      progress_note: progressNote || null,
      next_action: nextAction || null,
      notes: notes || null,
      last_touched: new Date().toISOString(),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">{thread.title}</DialogTitle>
          {thread.sub && <p className="text-xs text-muted-foreground">{thread.sub}</p>}
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Status</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="done">Done</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Progress — {progress}%
            </label>
            <Slider
              value={[progress]}
              onValueChange={([v]) => setProgress(v)}
              min={0}
              max={100}
              step={5}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Progress Note</label>
            <Input
              value={progressNote}
              onChange={(e) => setProgressNote(e.target.value)}
              placeholder="What's the current state?"
              className="h-9"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Next Action</label>
            <Input
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value)}
              placeholder="What needs to happen next?"
              className="h-9"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Notes</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional context..."
              rows={3}
            />
          </div>

          <Button onClick={handleSave} disabled={isPending} className="w-full">
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

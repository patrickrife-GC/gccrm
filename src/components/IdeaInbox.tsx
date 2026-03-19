import { useState } from "react";
import { useIdeas, useCreateIdea, useUpdateIdea, useDeleteIdea } from "@/hooks/useIdeas";
import { IDEA_TYPES } from "@/lib/threadTypes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Pencil, X, Plus } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export function IdeaInbox() {
  const { data: ideas, isLoading } = useIdeas();
  const createIdea = useCreateIdea();
  const updateIdea = useUpdateIdea();
  const deleteIdea = useDeleteIdea();

  const [title, setTitle] = useState("");
  const [type, setType] = useState("podcast");
  const [filterType, setFilterType] = useState<string | null>(null);

  const [editIdea, setEditIdea] = useState<{ id: string; title: string; notes: string; type: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    createIdea.mutate({ type, title: title.trim() });
    setTitle("");
  };

  const filtered = ideas?.filter((i) => {
    if (filterType && i.type !== filterType) return false;
    return true;
  }) ?? [];

  const typeInfo = (key: string) => IDEA_TYPES.find((t) => t.key === key);

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Capture an idea..."
          className="flex-1 h-9"
        />
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-[180px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {IDEA_TYPES.map((t) => (
              <SelectItem key={t.key} value={t.key}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit" size="sm" disabled={createIdea.isPending || !title.trim()}>
          <Plus className="w-4 h-4" />
        </Button>
      </form>

      <div className="flex flex-wrap gap-1.5">
        <Button
          size="sm"
          variant={filterType === null ? "default" : "outline"}
          className="h-7 text-xs"
          onClick={() => setFilterType(null)}
        >
          All
        </Button>
        {IDEA_TYPES.map((t) => (
          <Button
            key={t.key}
            size="sm"
            variant={filterType === t.key ? "default" : "outline"}
            className="h-7 text-xs"
            onClick={() => setFilterType(t.key)}
          >
            {t.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 rounded-lg border border-border bg-card animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No ideas yet. Start capturing above.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((idea) => {
            const ti = typeInfo(idea.type);
            return (
              <div
                key={idea.id}
                className={`rounded-lg border border-border bg-card p-4 transition-opacity ${idea.executed ? "opacity-40" : ""}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge variant="outline" className={`text-[10px] border shrink-0 ${ti?.color ?? ""}`}>
                    {ti?.label ?? idea.type}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                    {format(new Date(idea.created_at), "MMM d")}
                  </span>
                </div>
                <h4 className={`text-sm font-medium mb-1 ${idea.executed ? "line-through" : ""}`}>
                  {idea.title}
                </h4>
                {idea.notes && (
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{idea.notes}</p>
                )}
                <div className="flex gap-1 mt-auto">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => updateIdea.mutate({ id: idea.id, executed: !idea.executed })}
                    title={idea.executed ? "Mark as not executed" : "Mark as executed"}
                  >
                    <Check className="w-3 h-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => setEditIdea({ id: idea.id, title: idea.title, notes: idea.notes ?? "", type: idea.type })}
                  >
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-destructive"
                    onClick={() => deleteIdea.mutate(idea.id)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={!!editIdea} onOpenChange={(o) => !o && setEditIdea(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Edit Idea</DialogTitle>
          </DialogHeader>
          {editIdea && (
            <div className="space-y-3">
              <Input
                value={editIdea.title}
                onChange={(e) => setEditIdea({ ...editIdea, title: e.target.value })}
                className="h-9"
              />
              <Textarea
                value={editIdea.notes}
                onChange={(e) => setEditIdea({ ...editIdea, notes: e.target.value })}
                placeholder="Notes..."
                rows={3}
              />
              <Button
                className="w-full"
                disabled={updateIdea.isPending}
                onClick={() => {
                  updateIdea.mutate({
                    id: editIdea.id,
                    title: editIdea.title,
                    notes: editIdea.notes || null,
                  });
                  setEditIdea(null);
                }}
              >
                Save
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

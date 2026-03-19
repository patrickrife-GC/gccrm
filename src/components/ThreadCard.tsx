import { differenceInDays } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Hand, DollarSign } from "lucide-react";
import type { Thread } from "@/lib/threadTypes";
import { SECTION_COLORS, SECTION_BADGE_COLORS, STATUS_STYLES, SECTIONS } from "@/lib/threadTypes";

function StalenessDot({ lastTouched }: { lastTouched: string }) {
  const days = differenceInDays(new Date(), new Date(lastTouched));
  const color = days < 3 ? "bg-green-500" : days < 7 ? "bg-amber-500" : "bg-red-500";
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${color}`}
      title={`Last touched ${days}d ago`}
    />
  );
}

interface ThreadCardProps {
  thread: Thread;
  onTouch: (id: string) => void;
  onClick: (thread: Thread) => void;
  touchPending: boolean;
}

export function ThreadCard({ thread, onTouch, onClick, touchPending }: ThreadCardProps) {
  const sectionLabel = SECTIONS.find((s) => s.key === thread.section)?.label ?? thread.section;

  return (
    <div
      className={`rounded-lg border border-border border-l-4 p-4 cursor-pointer hover:bg-secondary/30 transition-colors ${SECTION_COLORS[thread.section] ?? ""}`}
      onClick={() => onClick(thread)}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <StalenessDot lastTouched={thread.last_touched} />
            <h3 className="text-sm font-semibold truncate">{thread.title}</h3>
          </div>
          {thread.sub && (
            <p className="text-xs text-muted-foreground truncate">{thread.sub}</p>
          )}
        </div>
        <Badge className={`text-[10px] shrink-0 border ${STATUS_STYLES[thread.status] ?? ""}`}>
          {thread.status}
        </Badge>
      </div>

      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-muted-foreground font-mono">{thread.progress}%</span>
          <Badge variant="outline" className={`text-[10px] border ${SECTION_BADGE_COLORS[thread.section] ?? ""}`}>
            {sectionLabel}
          </Badge>
        </div>
        <Progress value={thread.progress} className="h-1.5" />
        {thread.progress_note && (
          <p className="text-[10px] text-muted-foreground mt-1 truncate">{thread.progress_note}</p>
        )}
      </div>

      {thread.next_action && (
        <div className="bg-secondary/50 rounded px-2 py-1.5 mb-2">
          <p className="text-[11px] text-foreground/80 leading-snug">
            <span className="font-medium text-muted-foreground">Next:</span> {thread.next_action}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1 flex-1 min-w-0">
          {thread.tags?.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">
              {tag}
            </span>
          ))}
          {(thread.tags?.length ?? 0) > 3 && (
            <span className="text-[10px] text-muted-foreground">+{thread.tags!.length - 3}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {thread.revenue && (
            <Badge variant="outline" className="text-[10px] border-accent/30 text-accent">
              <DollarSign className="w-3 h-3 mr-0.5" />
              {thread.revenue}
            </Badge>
          )}
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            disabled={touchPending}
            onClick={(e) => {
              e.stopPropagation();
              onTouch(thread.id);
            }}
            title="Touch — mark as recently worked on"
          >
            <Hand className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

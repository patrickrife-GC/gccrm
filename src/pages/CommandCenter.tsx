import { useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useThreads, useUpdateThread, useTouchThread } from "@/hooks/useThreads";
import { ThreadCard } from "@/components/ThreadCard";
import { ThreadEditModal } from "@/components/ThreadEditModal";
import { IdeaInbox } from "@/components/IdeaInbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { differenceInDays } from "date-fns";
import { Activity, CheckCircle, DollarSign, AlertTriangle, Layers } from "lucide-react";
import type { Thread } from "@/lib/threadTypes";
import { SECTIONS, SECTION_BADGE_COLORS, STATUS_STYLES } from "@/lib/threadTypes";
import { toast } from "@/hooks/use-toast";

type SubView = "all" | "focus" | "ideas";

export default function CommandCenter() {
  const { data: threads, isLoading } = useThreads();
  const updateThread = useUpdateThread();
  const touchThread = useTouchThread();

  const [view, setView] = useState<SubView>("all");
  const [editThread, setEditThread] = useState<Thread | null>(null);

  const stats = useMemo(() => {
    if (!threads) return { total: 0, active: 0, near: 0, revenue: 0, stale: 0 };
    return {
      total: threads.length,
      active: threads.filter((t) => t.status === "active").length,
      near: threads.filter((t) => t.progress >= 90 && t.status !== "done").length,
      revenue: threads.filter((t) => t.revenue).length,
      stale: threads.filter((t) => differenceInDays(new Date(), new Date(t.last_touched)) >= 7).length,
    };
  }, [threads]);

  const grouped = useMemo(() => {
    if (!threads) return {};
    const map: Record<string, Thread[]> = {};
    for (const t of threads) {
      (map[t.section] ??= []).push(t);
    }
    return map;
  }, [threads]);

  const focusThreads = useMemo(() => {
    if (!threads) return [];
    return threads
      .filter((t) => t.status !== "done" && t.status !== "low")
      .sort((a, b) => {
        const statusOrder: Record<string, number> = { blocked: 0, active: 1, pending: 2 };
        const sa = statusOrder[a.status] ?? 3;
        const sb = statusOrder[b.status] ?? 3;
        if (sa !== sb) return sa - sb;
        return b.progress - a.progress;
      });
  }, [threads]);

  const handleTouch = (id: string) => {
    touchThread.mutate(id, {
      onSuccess: () => toast({ title: "Thread touched" }),
    });
  };

  const handleSave = (updates: Partial<Thread> & { id: string }) => {
    updateThread.mutate(updates, {
      onSuccess: () => toast({ title: "Thread updated" }),
    });
  };

  const handleFocusCheck = (id: string) => {
    updateThread.mutate({
      id,
      last_touched: new Date().toISOString(),
    });
  };

  const statCards = [
    { label: "Total", value: stats.total, icon: <Layers className="w-4 h-4" /> },
    { label: "Active", value: stats.active, icon: <Activity className="w-4 h-4" /> },
    { label: "90%+", value: stats.near, icon: <CheckCircle className="w-4 h-4" /> },
    { label: "Revenue", value: stats.revenue, icon: <DollarSign className="w-4 h-4" /> },
    { label: "Stale 7d+", value: stats.stale, icon: <AlertTriangle className="w-4 h-4" /> },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Command Center</h1>
          <p className="text-sm text-muted-foreground mt-1">Your ecosystem at a glance</p>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {statCards.map((s) => (
            <div key={s.label} className="rounded-lg border border-border bg-card px-4 py-3 flex items-center gap-3">
              <div className="text-muted-foreground">{s.icon}</div>
              <div>
                <p className="text-lg font-semibold font-mono">{s.value}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Sub-view toggle */}
        <div className="flex gap-1.5">
          {([
            ["all", "All Threads"],
            ["focus", "Today's Focus"],
            ["ideas", "Idea Inbox"],
          ] as const).map(([key, label]) => (
            <Button
              key={key}
              size="sm"
              variant={view === key ? "default" : "outline"}
              onClick={() => setView(key)}
            >
              {label}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 rounded-lg border border-border bg-card animate-pulse" />
            ))}
          </div>
        ) : view === "all" ? (
          <div className="space-y-8">
            {SECTIONS.map((sec) => {
              const sectionThreads = grouped[sec.key];
              if (!sectionThreads?.length) return null;
              return (
                <div key={sec.key}>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className={`border ${SECTION_BADGE_COLORS[sec.key]}`}>
                      {sec.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono">{sectionThreads.length}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {sectionThreads.map((t) => (
                      <ThreadCard
                        key={t.id}
                        thread={t}
                        onTouch={handleTouch}
                        onClick={setEditThread}
                        touchPending={touchThread.isPending}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : view === "focus" ? (
          <div className="space-y-2">
            {focusThreads.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nothing to focus on — all clear!</p>
            ) : (
              focusThreads.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 hover:bg-secondary/30 transition-colors cursor-pointer"
                  onClick={() => setEditThread(t)}
                >
                  <Checkbox
                    checked={false}
                    onCheckedChange={() => handleFocusCheck(t.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{t.title}</span>
                      <Badge variant="outline" className={`text-[10px] border ${STATUS_STYLES[t.status]}`}>
                        {t.status}
                      </Badge>
                    </div>
                    {t.next_action && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{t.next_action}</p>
                    )}
                  </div>
                  <span className="text-xs font-mono text-muted-foreground shrink-0">{t.progress}%</span>
                </div>
              ))
            )}
          </div>
        ) : (
          <IdeaInbox />
        )}
      </div>

      <ThreadEditModal
        thread={editThread}
        open={!!editThread}
        onOpenChange={(o) => !o && setEditThread(null)}
        onSave={handleSave}
        isPending={updateThread.isPending}
      />
    </AppLayout>
  );
}

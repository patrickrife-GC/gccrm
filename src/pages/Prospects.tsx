import { useMemo, useState, useCallback } from "react";
import { AppLayout } from "@/components/AppLayout";
import { StatCard } from "@/components/StatCard";
import { ProspectCard } from "@/components/ProspectCard";
import {
  useIcpStaging,
  useIcpStagingAll,
  usePromoteProspect,
  useSkipProspect,
} from "@/hooks/useIcpStaging";
import { CheckCircle2 } from "lucide-react";
import { isThisWeek } from "date-fns";

const BRAND_FILTERS = ["All brands", "Ground Control", "Ideoloop", "Baltimore Creators"];
const SEGMENT_FILTERS = [
  "All segments",
  "Stuck Scaler",
  "Identity Shifter",
  "Busy Expert",
  "Technical Builder",
];

export default function Prospects() {
  const { data: queue, isLoading } = useIcpStaging();
  const { data: allProspects } = useIcpStagingAll();
  const promote = usePromoteProspect();
  const skip = useSkipProspect();

  const [brandFilter, setBrandFilter] = useState("All brands");
  const [segmentFilter, setSegmentFilter] = useState("All segments");

  const promotedThisWeek = useMemo(
    () =>
      (allProspects ?? []).filter(
        (p) => p.promoted && p.promoted_at && isThisWeek(new Date(p.promoted_at))
      ).length,
    [allProspects]
  );

  const skippedTotal = useMemo(
    () => (allProspects ?? []).filter((p) => p.skipped).length,
    [allProspects]
  );

  const brandCounts = useMemo(() => {
    const q = queue ?? [];
    return {
      gc: q.filter((p) => p.brand === "Ground Control").length,
      ideoloop: q.filter((p) => p.brand === "Ideoloop").length,
      bc: q.filter((p) => p.brand === "Baltimore Creators").length,
    };
  }, [queue]);

  const filtered = useMemo(() => {
    let list = queue ?? [];
    if (brandFilter !== "All brands") list = list.filter((p) => p.brand === brandFilter);
    if (segmentFilter !== "All segments")
      list = list.filter((p) => p.icp_segment === segmentFilter);
    return list;
  }, [queue, brandFilter, segmentFilter]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Prospect Review Queue</h1>

        {/* Stats strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="In Queue" value={queue?.length ?? 0} />
          <StatCard label="Promoted This Week" value={promotedThisWeek} />
          <StatCard label="Skipped Total" value={skippedTotal} />
          <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-1">
            <span className="text-xs text-muted-foreground font-medium">By Brand</span>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm">
                <span className="text-purple-400 font-semibold">{brandCounts.gc}</span>{" "}
                <span className="text-muted-foreground">GC</span>
              </span>
              <span className="text-sm">
                <span className="text-teal-400 font-semibold">{brandCounts.ideoloop}</span>{" "}
                <span className="text-muted-foreground">Ideoloop</span>
              </span>
              <span className="text-sm">
                <span className="text-amber-400 font-semibold">{brandCounts.bc}</span>{" "}
                <span className="text-muted-foreground">BC</span>
              </span>
            </div>
          </div>
        </div>

        {/* Brand filter pills */}
        <div className="flex flex-wrap gap-2">
          {BRAND_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setBrandFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                brandFilter === f
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-secondary/50 text-muted-foreground border-border hover:bg-secondary"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Segment filter pills */}
        <div className="flex flex-wrap gap-2">
          {SEGMENT_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setSegmentFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                segmentFilter === f
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-secondary/50 text-muted-foreground border-border hover:bg-secondary"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <p className="text-muted-foreground text-sm">Loading prospects…</p>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500/50 mb-4" />
            <p className="text-muted-foreground">
              Queue is clear — next batch arrives tomorrow at 8am
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <ProspectCard
                key={p.id}
                prospect={p}
                onPromote={(pr) => promote.mutate(pr)}
                onSkip={(id, reason) => skip.mutate({ id, skip_reason: reason })}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

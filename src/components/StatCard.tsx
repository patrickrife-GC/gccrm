import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number;
  accent: "total" | "founders" | "investors" | "recent";
  icon: React.ReactNode;
}

const accentMap = {
  total: "bg-stat-total/10 text-stat-total",
  founders: "bg-stat-founders/10 text-stat-founders",
  investors: "bg-stat-investors/10 text-stat-investors",
  recent: "bg-stat-recent/10 text-stat-recent",
};

export function StatCard({ label, value, accent, icon }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", accentMap[accent])}>
          {icon}
        </div>
      </div>
      <span className="text-3xl font-semibold tracking-tight font-mono">{value}</span>
    </div>
  );
}

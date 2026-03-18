import { Users, Rocket, TrendingUp, Clock, ExternalLink } from "lucide-react";
import { useContacts, useUpdateContact } from "@/hooks/useContacts";
import { StatCard } from "@/components/StatCard";
import { AppLayout } from "@/components/AppLayout";
import { format, subDays, isAfter, isBefore, parseISO } from "date-fns";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { data: contacts, isLoading } = useContacts();

  const total = contacts?.length ?? 0;
  const founders = contacts?.filter((c) =>
    c.title?.toLowerCase().includes("founder") ||
    c.title?.toLowerCase().includes("ceo") ||
    c.title?.toLowerCase().includes("co-founder")
  ).length ?? 0;
  const investors = contacts?.filter((c) =>
    c.title?.toLowerCase().includes("investor") ||
    c.title?.toLowerCase().includes("partner") ||
    c.title?.toLowerCase().includes("vc") ||
    c.industry_cluster?.toLowerCase().includes("venture")
  ).length ?? 0;
  const recentlyConnected = contacts?.filter((c) =>
    c.connected_on && isAfter(parseISO(c.connected_on), subDays(new Date(), 30))
  ).length ?? 0;

  const recentContacts = contacts?.slice(0, 5) ?? [];

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Your network at a glance</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 rounded-xl border border-border bg-card animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Contacts" value={total} accent="total" icon={<Users className="w-4 h-4" />} />
            <StatCard label="Founders" value={founders} accent="founders" icon={<Rocket className="w-4 h-4" />} />
            <StatCard label="Investors" value={investors} accent="investors" icon={<TrendingUp className="w-4 h-4" />} />
            <StatCard label="Last 30 Days" value={recentlyConnected} accent="recent" icon={<Clock className="w-4 h-4" />} />
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Connections</h2>
            <Link to="/contacts" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              View all →
            </Link>
          </div>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Company</th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Title</th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Connected</th>
                </tr>
              </thead>
              <tbody>
                {recentContacts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No contacts yet. Add some to get started.
                    </td>
                  </tr>
                ) : (
                  recentContacts.map((contact) => (
                    <tr key={contact.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3">
                        <Link to={`/contacts/${contact.id}`} className="font-medium text-sm hover:underline">
                          {contact.full_name || `${contact.first_name ?? ""} ${contact.last_name ?? ""}`.trim() || "—"}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">{contact.company ?? "—"}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{contact.title ?? "—"}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground font-mono hidden lg:table-cell">
                        {contact.connected_on ? format(parseISO(contact.connected_on), "MMM d, yyyy") : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

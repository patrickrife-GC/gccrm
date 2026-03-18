import { useMemo } from "react";
import { Users, Rocket, TrendingUp, Clock, ExternalLink, X } from "lucide-react";
import { useContacts, useUpdateContact } from "@/hooks/useContacts";
import { StatCard } from "@/components/StatCard";
import { AppLayout } from "@/components/AppLayout";
import { format, subDays, addDays, isAfter, isBefore, parseISO } from "date-fns";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const isSkipped = (skipUntil: string | null) => {
  if (!skipUntil) return false;
  return isAfter(parseISO(skipUntil), new Date());
};

export default function Dashboard() {
  const { data: contacts, isLoading } = useContacts();
  const updateContact = useUpdateContact();

  const today = new Date();
  const ninetyDaysAgo = subDays(today, 90);

  const handleMarkContacted = (id: string) => {
    updateContact.mutate(
      { id, last_contacted: format(today, "yyyy-MM-dd"), next_action_date: format(addDays(today, 30), "yyyy-MM-dd") },
      { onSuccess: () => toast({ title: "Marked as contacted — follow up in 30 days" }) }
    );
  };

  const handleSkip = (id: string) => {
    const skipDate = format(addDays(today, 7), "yyyy-MM-dd");
    updateContact.mutate(
      { id, skip_until: skipDate },
      { onSuccess: () => toast({ title: "Skipped for 7 days" }) }
    );
  };

  const todaysFive = useMemo(() => {
    if (!contacts) return [];
    const todayStr = format(today, "yyyy-MM-dd");
    return contacts
      .filter((c) => !isSkipped(c.skip_until))
      .sort((a, b) => {
        // Founders first
        const aFounder = a.industry_cluster?.toLowerCase() === "founder" ? 0 : 1;
        const bFounder = b.industry_cluster?.toLowerCase() === "founder" ? 0 : 1;
        if (aFounder !== bFounder) return aFounder - bFounder;
        // Actionable (null or <= today) first
        const aActionable = !a.next_action_date || a.next_action_date <= todayStr ? 0 : 1;
        const bActionable = !b.next_action_date || b.next_action_date <= todayStr ? 0 : 1;
        if (aActionable !== bActionable) return aActionable - bActionable;
        // No last_contacted first
        const aHas = a.last_contacted ? 1 : 0;
        const bHas = b.last_contacted ? 1 : 0;
        if (aHas !== bHas) return aHas - bHas;
        // Oldest last_contacted first
        if (a.last_contacted && b.last_contacted) {
          const diff = parseISO(a.last_contacted).getTime() - parseISO(b.last_contacted).getTime();
          if (diff !== 0) return diff;
        }
        // Most recently connected first
        if (!a.connected_on) return 1;
        if (!b.connected_on) return -1;
        return parseISO(b.connected_on).getTime() - parseISO(a.connected_on).getTime();
      })
      .slice(0, 5);
  }, [contacts]);
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

  const reconnectRadar = contacts
    ?.filter((c) => {
      if (isSkipped(c.skip_until)) return false;
      if (c.industry_cluster?.toLowerCase() !== "founder") return false;
      if (!c.last_contacted) return true;
      return isBefore(parseISO(c.last_contacted), ninetyDaysAgo);
    })
    .sort((a, b) => {
      if (!a.connected_on) return 1;
      if (!b.connected_on) return -1;
      return parseISO(b.connected_on).getTime() - parseISO(a.connected_on).getTime();
    })
    .slice(0, 25) ?? [];

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

        <div>
          <h2 className="text-lg font-semibold mb-1">Today's 5</h2>
          <p className="text-sm text-muted-foreground mb-4">Your daily outreach priorities</p>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Company</th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Title</th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {todaysFive.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      All done for today! 🎉
                    </td>
                  </tr>
                ) : (
                  todaysFive.map((contact) => (
                    <tr key={contact.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link to={`/contacts/${contact.id}`} className="font-medium text-sm hover:underline">
                            {contact.full_name || `${contact.first_name ?? ""} ${contact.last_name ?? ""}`.trim() || "—"}
                          </Link>
                          {contact.linkedin_url && (
                            <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">{contact.company ?? "—"}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{contact.title ?? "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkContacted(contact.id)}
                            disabled={updateContact.isPending}
                          >
                            Mark Contacted
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleSkip(contact.id)}
                          >
                            <X className="w-3 h-3 mr-1" />
                            Skip
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Reconnect Radar</h2>
          <p className="text-sm text-muted-foreground mb-4">Founders you haven't contacted in 90+ days</p>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Company</th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Title</th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Connected</th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Last Contacted</th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {reconnectRadar.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No founders need reconnecting right now.
                    </td>
                  </tr>
                ) : (
                  reconnectRadar.map((contact) => (
                    <tr key={contact.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link to={`/contacts/${contact.id}`} className="font-medium text-sm hover:underline">
                            {contact.full_name || `${contact.first_name ?? ""} ${contact.last_name ?? ""}`.trim() || "—"}
                          </Link>
                          {contact.linkedin_url && (
                            <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">{contact.company ?? "—"}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{contact.title ?? "—"}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground font-mono hidden lg:table-cell">
                        {contact.connected_on ? format(parseISO(contact.connected_on), "MMM d, yyyy") : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground font-mono hidden lg:table-cell">
                        {contact.last_contacted ? format(parseISO(contact.last_contacted), "MMM d, yyyy") : "Never"}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkContacted(contact.id)}
                          disabled={updateContact.isPending}
                        >
                          Mark Contacted
                        </Button>
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

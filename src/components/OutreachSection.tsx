import { useMemo } from "react";
import { ExternalLink, X } from "lucide-react";
import { Link } from "react-router-dom";
import { format, parseISO, differenceInDays, startOfDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Contact } from "@/lib/types";

const ANGLE_STYLES: Record<string, string> = {
  podcast_guest: "bg-primary/15 text-primary border-primary/30",
  newsletter_feature: "bg-primary/15 text-primary border-primary/30",
  services_intro: "bg-primary/15 text-primary border-primary/30",
  story_to_content: "bg-accent/20 text-accent-foreground border-accent/40",
  content_amplification: "bg-accent/20 text-accent-foreground border-accent/40",
  event_invite: "bg-secondary text-secondary-foreground border-border",
};

const ANGLE_LABELS: Record<string, string> = {
  podcast_guest: "Podcast Guest",
  newsletter_feature: "Newsletter Feature",
  services_intro: "Services Intro",
  story_to_content: "Story → Content",
  content_amplification: "Content Amplification",
  event_invite: "Event Invite",
};

function AngleBadge({ angle }: { angle: string | null }) {
  if (!angle) return null;
  const style = ANGLE_STYLES[angle] ?? "bg-secondary text-secondary-foreground border-border";
  const label = ANGLE_LABELS[angle] ?? angle.replace(/_/g, " ");
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${style}`}>
      {label}
    </span>
  );
}

function NextActionBadge({ date }: { date: string | null }) {
  if (!date) return <span className="text-muted-foreground">—</span>;
  const days = differenceInDays(startOfDay(parseISO(date)), startOfDay(new Date()));
  if (days < 0) return <span className="text-destructive font-medium">Overdue</span>;
  if (days === 0) return <span className="text-destructive font-medium">Due today</span>;
  if (days <= 7) return <span className="text-yellow-500 font-medium">In {days}d</span>;
  return <span className="text-muted-foreground">In {days}d</span>;
}

const isSkipped = (skipUntil: string | null) => {
  if (!skipUntil) return false;
  const now = new Date();
  return parseISO(skipUntil) > now;
};

interface OutreachSectionProps {
  title: string;
  intentKey: string;
  contacts: Contact[];
  onMarkContacted: (id: string, days: number) => void;
  onSkip: (id: string) => void;
  isPending: boolean;
}

export function OutreachSection({ title, intentKey, contacts, onMarkContacted, onSkip, isPending }: OutreachSectionProps) {
  const todayStr = format(new Date(), "yyyy-MM-dd");

  const filtered = useMemo(() => {
    return contacts
      .filter((c) => {
        if (isSkipped(c.skip_until)) return false;
        return c.outreach_intent?.includes(intentKey);
      })
      .sort((a, b) => {
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
  }, [contacts, intentKey, todayStr]);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-1">{title}</h2>
      <p className="text-sm text-muted-foreground mb-4">Top 5 outreach priorities</p>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Company</th>
              <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Title</th>
              <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Last Contacted</th>
              <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Next Action</th>
              <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  All done for this list! 🎉
                </td>
              </tr>
            ) : (
              filtered.map((contact) => (
                <tr key={contact.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1.5">
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
                      <AngleBadge angle={contact.outreach_angle} />
                      {contact.suggested_message && (
                        <p className="text-xs text-muted-foreground italic leading-snug max-w-xs">
                          "{contact.suggested_message}"
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">{contact.company ?? "—"}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{contact.title ?? "—"}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground font-mono hidden lg:table-cell">
                    {contact.last_contacted ? format(parseISO(contact.last_contacted), "MMM d, yyyy") : "Never"}
                  </td>
                  <td className="px-4 py-3 text-sm hidden lg:table-cell">
                    <NextActionBadge date={contact.next_action_date} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline" disabled={isPending}>
                            Mark Contacted
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onMarkContacted(contact.id, 7)}>Follow up in 7 days</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onMarkContacted(contact.id, 30)}>Follow up in 30 days</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onMarkContacted(contact.id, 90)}>Follow up in 90 days</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button size="sm" variant="ghost" onClick={() => onSkip(contact.id)}>
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
  );
}

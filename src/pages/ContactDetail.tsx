import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Mail, Building2, Briefcase, Calendar } from "lucide-react";
import { useContact, useUpdateContact } from "@/hooks/useContacts";
import { AppLayout } from "@/components/AppLayout";
import { Textarea } from "@/components/ui/textarea";
import { format, parseISO } from "date-fns";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

const OUTREACH_OPTIONS = [
  { value: "ground_control", label: "Ground Control" },
  { value: "ideoloop", label: "Ideoloop" },
  { value: "baltimore_creators", label: "Baltimore Creators" },
] as const;

export default function ContactDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: contact, isLoading } = useContact(id!);
  const updateContact = useUpdateContact();
  const [notes, setNotes] = useState("");
  const [lastContacted, setLastContacted] = useState("");

  useEffect(() => {
    if (contact) {
      setNotes(contact.notes ?? "");
      setLastContacted(contact.last_contacted ?? "");
    }
  }, [contact]);

  const handleSaveNotes = () => {
    if (!id) return;
    updateContact.mutate(
      { id, notes, last_contacted: lastContacted || null },
      { onSuccess: () => toast.success("Contact updated") }
    );
  };

  const displayName = contact?.full_name || `${contact?.first_name ?? ""} ${contact?.last_name ?? ""}`.trim() || "Unknown";

  if (isLoading) {
    return (
      <AppLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 bg-secondary rounded" />
          <div className="h-40 bg-secondary rounded-xl" />
        </div>
      </AppLayout>
    );
  }

  if (!contact) {
    return (
      <AppLayout>
        <div className="text-center py-12 text-muted-foreground">Contact not found.</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl space-y-6">
        <Link to="/contacts" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to contacts
        </Link>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{displayName}</h1>
          {contact.title && (
            <p className="text-muted-foreground mt-1">{contact.title}{contact.company ? ` at ${contact.company}` : ""}</p>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {contact.company && (
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-sm">{contact.company}</span>
              </div>
            )}
            {contact.title && (
              <div className="flex items-center gap-3">
                <Briefcase className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-sm">{contact.title}</span>
              </div>
            )}
            {contact.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                <a href={`mailto:${contact.email}`} className="text-sm hover:underline">{contact.email}</a>
              </div>
            )}
            {contact.linkedin_url && (
              <div className="flex items-center gap-3">
                <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
                <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">
                  LinkedIn Profile
                </a>
              </div>
            )}
            {contact.connected_on && (
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-sm font-mono">{format(parseISO(contact.connected_on), "MMMM d, yyyy")}</span>
              </div>
            )}
            {contact.industry_cluster && (
              <div className="flex items-center gap-3">
                <span className="inline-flex px-2 py-0.5 rounded-md bg-secondary text-xs font-medium">
                  {contact.industry_cluster}
                </span>
              </div>
            )}
          </div>
          {contact.influence_score != null && contact.influence_score > 0 && (
            <div className="pt-2 border-t border-border">
              <span className="text-xs text-muted-foreground">Influence Score</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-2 flex-1 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full bg-accent transition-all"
                    style={{ width: `${Math.min(contact.influence_score, 100)}%` }}
                  />
                </div>
                <span className="text-sm font-mono font-medium">{contact.influence_score}</span>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Notes & Follow-up</h2>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Last Contacted</label>
            <input
              type="date"
              value={lastContacted}
              onChange={(e) => setLastContacted(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Notes</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Meeting notes, follow-up reminders..."
              rows={4}
            />
          </div>
          <button
            onClick={handleSaveNotes}
            disabled={updateContact.isPending}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {updateContact.isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </AppLayout>
  );
}

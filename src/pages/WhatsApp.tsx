import { useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useWaContacts, useUpdateWaContact, useCreateWaContact } from "@/hooks/useWaContacts";
import type { WaContact } from "@/hooks/useWaContacts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, GitMerge, UserCheck, Send, MessageCircle, Plus, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Filter = "all" | "cross" | "va" | "creator" | "not_sent" | "sent" | "responded";

export default function WhatsApp() {
  const { data: contacts, isLoading } = useWaContacts();
  const updateWa = useUpdateWaContact();
  const createWa = useCreateWaContact();

  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", sub: "", groups: "", type: "creator", jid: "" });

  const crossGroupJids = useMemo(() => {
    if (!contacts) return new Set<string>();
    return new Set(contacts.filter((c) => c.groups.length > 1).map((c) => c.jid));
  }, [contacts]);

  const filtered = useMemo(() => {
    if (!contacts) return [];
    let list = contacts;

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.sub?.toLowerCase().includes(q)) ||
          c.groups.some((g) => g.toLowerCase().includes(q))
      );
    }

    switch (filter) {
      case "cross": list = list.filter((c) => c.groups.length > 1); break;
      case "va": list = list.filter((c) => c.type === "va"); break;
      case "creator": list = list.filter((c) => c.type === "creator"); break;
      case "not_sent": list = list.filter((c) => !c.sent); break;
      case "sent": list = list.filter((c) => c.sent); break;
      case "responded": list = list.filter((c) => c.responded); break;
    }

    return list;
  }, [contacts, search, filter]);

  const stats = useMemo(() => {
    if (!contacts) return { total: 0, cross: 0, va: 0, creator: 0, sent: 0, responded: 0 };
    return {
      total: contacts.length,
      cross: contacts.filter((c) => c.groups.length > 1).length,
      va: contacts.filter((c) => c.type === "va").length,
      creator: contacts.filter((c) => c.type === "creator").length,
      sent: contacts.filter((c) => c.sent).length,
      responded: contacts.filter((c) => c.responded).length,
    };
  }, [contacts]);

  const handleToggle = (jid: string, field: "sent" | "responded", current: boolean) => {
    updateWa.mutate({ jid, [field]: !current });
  };

  const handleAdd = () => {
    if (!newContact.name.trim() || !newContact.jid.trim()) return;
    createWa.mutate(
      {
        jid: newContact.jid.trim(),
        name: newContact.name.trim(),
        sub: newContact.sub.trim() || undefined,
        groups: newContact.groups.split(",").map((g) => g.trim()).filter(Boolean),
        type: newContact.type,
      },
      {
        onSuccess: () => {
          toast({ title: "Contact added" });
          setAddOpen(false);
          setNewContact({ name: "", sub: "", groups: "", type: "creator", jid: "" });
        },
        onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
      }
    );
  };

  const statCards = [
    { label: "Total", value: stats.total, icon: <Users className="w-4 h-4" /> },
    { label: "Cross-group", value: stats.cross, icon: <GitMerge className="w-4 h-4" /> },
    { label: "VAs", value: stats.va, icon: <UserCheck className="w-4 h-4" /> },
    { label: "Creators", value: stats.creator, icon: <Users className="w-4 h-4" /> },
    { label: "Sent", value: stats.sent, icon: <Send className="w-4 h-4" /> },
    { label: "Responded", value: stats.responded, icon: <MessageCircle className="w-4 h-4" /> },
  ];

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "cross", label: "Cross-group" },
    { key: "va", label: "VAs" },
    { key: "creator", label: "Creators" },
    { key: "not_sent", label: "Not sent" },
    { key: "sent", label: "Sent" },
    { key: "responded", label: "Responded" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">WhatsApp Outreach</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your WhatsApp contact pipeline</p>
          </div>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> Add Contact
          </Button>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {statCards.map((s) => (
            <div key={s.label} className="rounded-lg border border-border bg-card px-3 py-2.5 flex items-center gap-2.5">
              <div className="text-muted-foreground">{s.icon}</div>
              <div>
                <p className="text-lg font-semibold font-mono">{s.value}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filter pills + search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex flex-wrap gap-1.5">
            {filters.map((f) => (
              <Button
                key={f.key}
                size="sm"
                variant={filter === f.key ? "default" : "outline"}
                className="h-7 text-xs"
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </Button>
            ))}
          </div>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, sub, group..."
            className="h-8 sm:w-64"
          />
        </div>

        {/* Cross-group alert */}
        {filter === "cross" && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
            <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-300">
              <strong>{stats.cross}</strong> contacts appear in multiple groups — DM once only, using the message most relevant to their primary group.
            </p>
          </div>
        )}

        {/* Contact list */}
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-12 rounded-lg border border-border bg-card animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No contacts match your filters.</p>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Groups</th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Type</th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider text-center">Sent</th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider text-center">Responded</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const isCross = crossGroupJids.has(c.jid);
                  return (
                    <tr
                      key={c.jid}
                      className={`border-b border-border last:border-0 hover:bg-secondary/30 transition-colors ${isCross ? "border-l-2 border-l-destructive" : ""}`}
                    >
                      <td className="px-4 py-3">
                        <div>
                          <span className="text-sm font-medium">{c.name}</span>
                          {c.sub && <p className="text-xs text-muted-foreground">{c.sub}</p>}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {c.groups.map((g) => (
                            <Badge
                              key={g}
                              variant="outline"
                              className={`text-[10px] ${isCross ? "border-destructive/50 text-destructive" : "border-border text-muted-foreground"}`}
                            >
                              {g}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <Badge
                          variant="outline"
                          className={`text-[10px] border ${c.type === "creator" ? "border-purple-500/30 text-purple-400 bg-purple-500/10" : "border-teal-500/30 text-teal-400 bg-teal-500/10"}`}
                        >
                          {c.type === "creator" ? "Creator" : "VA"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Checkbox
                          checked={c.sent}
                          onCheckedChange={() => handleToggle(c.jid, "sent", c.sent)}
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Checkbox
                          checked={c.responded}
                          onCheckedChange={() => handleToggle(c.jid, "responded", c.responded)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add contact modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Add WhatsApp Contact</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">JID</label>
              <Input
                value={newContact.jid}
                onChange={(e) => setNewContact({ ...newContact, jid: e.target.value })}
                placeholder="WhatsApp JID"
                className="h-9"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Name</label>
              <Input
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                placeholder="Contact name"
                className="h-9"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Sub</label>
              <Input
                value={newContact.sub}
                onChange={(e) => setNewContact({ ...newContact, sub: e.target.value })}
                placeholder="Subtitle / description"
                className="h-9"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Groups (comma-separated)</label>
              <Input
                value={newContact.groups}
                onChange={(e) => setNewContact({ ...newContact, groups: e.target.value })}
                placeholder="APX, WCG, LLF"
                className="h-9"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Type</label>
              <Select value={newContact.type} onValueChange={(v) => setNewContact({ ...newContact, type: v })}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="creator">Creator</SelectItem>
                  <SelectItem value="va">VA</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={handleAdd} disabled={createWa.isPending || !newContact.name.trim() || !newContact.jid.trim()}>
              Add Contact
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

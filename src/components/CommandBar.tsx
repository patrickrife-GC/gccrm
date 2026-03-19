import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useContacts } from "@/hooks/useContacts";
import { useThreads } from "@/hooks/useThreads";
import { useWaContacts } from "@/hooks/useWaContacts";
import { Layers, Users, MessageCircle } from "lucide-react";

export function CommandBar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const { data: contacts } = useContacts();
  const { data: threads } = useThreads();
  const { data: waContacts } = useWaContacts();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (value: string) => {
    setOpen(false);
    if (value.startsWith("contact:")) {
      navigate(`/contacts/${value.replace("contact:", "")}`);
    } else if (value.startsWith("thread:")) {
      navigate("/command-center");
    } else if (value.startsWith("wa:")) {
      navigate("/whatsapp");
    }
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search threads, contacts, WhatsApp..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {threads && threads.length > 0 && (
          <CommandGroup heading="Threads">
            {threads.map((t) => (
              <CommandItem
                key={`thread:${t.id}`}
                value={`thread:${t.id} ${t.title} ${t.sub ?? ""} ${t.section}`}
                onSelect={() => handleSelect(`thread:${t.id}`)}
              >
                <Layers className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm">{t.title}</span>
                  {t.sub && <span className="text-xs text-muted-foreground ml-2">{t.sub}</span>}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {contacts && contacts.length > 0 && (
          <CommandGroup heading="Contacts">
            {contacts.slice(0, 50).map((c) => (
              <CommandItem
                key={`contact:${c.id}`}
                value={`contact:${c.id} ${c.full_name ?? ""} ${c.first_name ?? ""} ${c.last_name ?? ""} ${c.company ?? ""} ${c.email ?? ""}`}
                onSelect={() => handleSelect(`contact:${c.id}`)}
              >
                <Users className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm">{c.full_name || `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim() || "—"}</span>
                  {c.company && <span className="text-xs text-muted-foreground ml-2">{c.company}</span>}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {waContacts && waContacts.length > 0 && (
          <CommandGroup heading="WhatsApp">
            {waContacts.map((w) => (
              <CommandItem
                key={`wa:${w.jid}`}
                value={`wa:${w.jid} ${w.name} ${w.sub ?? ""} ${w.groups.join(" ")}`}
                onSelect={() => handleSelect(`wa:${w.jid}`)}
              >
                <MessageCircle className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm">{w.name}</span>
                  {w.sub && <span className="text-xs text-muted-foreground ml-2">{w.sub}</span>}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}

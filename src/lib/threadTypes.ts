export interface Thread {
  id: string;
  section: string;
  title: string;
  sub: string | null;
  status: string;
  progress: number;
  progress_note: string | null;
  next_action: string | null;
  tags: string[];
  revenue: string | null;
  notes: string | null;
  last_touched: string;
  created_at: string;
}

export interface Idea {
  id: string;
  type: string;
  title: string;
  notes: string | null;
  executed: boolean;
  created_at: string;
}

export const SECTIONS = [
  { key: "gc-core", label: "GC Core", color: "hsl(270 60% 55%)" },
  { key: "products", label: "Products", color: "hsl(170 60% 45%)" },
  { key: "deli-wire", label: "Deli Wire", color: "hsl(30 90% 50%)" },
  { key: "clients", label: "Clients", color: "hsl(150 60% 40%)" },
  { key: "pixilated", label: "Pixilated", color: "hsl(220 10% 55%)" },
] as const;

export const SECTION_COLORS: Record<string, string> = {
  "gc-core": "border-l-purple-500 bg-purple-500/5",
  "products": "border-l-teal-500 bg-teal-500/5",
  "deli-wire": "border-l-orange-500 bg-orange-500/5",
  "clients": "border-l-green-500 bg-green-500/5",
  "pixilated": "border-l-gray-500 bg-gray-500/5",
};

export const SECTION_BADGE_COLORS: Record<string, string> = {
  "gc-core": "bg-purple-500/15 text-purple-400 border-purple-500/30",
  "products": "bg-teal-500/15 text-teal-400 border-teal-500/30",
  "deli-wire": "bg-orange-500/15 text-orange-400 border-orange-500/30",
  "clients": "bg-green-500/15 text-green-400 border-green-500/30",
  "pixilated": "bg-gray-500/15 text-gray-400 border-gray-500/30",
};

export const STATUS_STYLES: Record<string, string> = {
  active: "bg-accent/15 text-accent border-accent/30",
  done: "bg-muted text-muted-foreground border-border",
  pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  blocked: "bg-destructive/15 text-destructive border-destructive/30",
  low: "bg-muted text-muted-foreground border-border",
};

export const IDEA_TYPES = [
  { key: "podcast", label: "🎙 Podcast", color: "bg-purple-500/15 text-purple-400 border-purple-500/30" },
  { key: "agent", label: "🤖 Agentic System", color: "bg-teal-500/15 text-teal-400 border-teal-500/30" },
  { key: "leadmag", label: "🧲 Lead Magnet", color: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  { key: "prompt", label: "✍️ Prompt", color: "bg-orange-500/15 text-orange-400 border-orange-500/30" },
  { key: "tool", label: "🔧 Tool", color: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
] as const;

export const DEFAULT_THREADS: Omit<Thread, "last_touched" | "created_at">[] = [
  { id: "c1", section: "gc-core", title: "Weekly Content Batch Automation", sub: "Podcast → YouTube → Newsletter → Social", status: "active", progress: 90, progress_note: "YouTube connector + end-to-end test remain", next_action: "Finish YouTube MCP OAuth, then run full skill test", tags: ["Transistor", "Beehiiv", "Typefully", "YouTube"], revenue: null, notes: null },
  { id: "c2", section: "gc-core", title: "LinkedIn Personal CRM", sub: "Central outreach engine for all GC initiatives", status: "active", progress: 30, progress_note: "Foundation started — needs full build-out", next_action: "Define segments (Ideoloop / Baltimore Creators / GC) + build sequences", tags: ["Ideoloop", "Baltimore Creators", "Outreach"], revenue: null, notes: null },
  { id: "c3", section: "gc-core", title: "Speaking Opportunities Outreach", sub: "GC thought leadership pipeline", status: "pending", progress: 0, progress_note: "Not started", next_action: "ID target conferences/podcasts, build list, draft pitch template", tags: ["Outbound", "Thought Leadership"], revenue: null, notes: null },
  { id: "c4", section: "products", title: "Ideoloop.ai", sub: "Voice-to-content app — ideoloop.ai", status: "active", progress: 75, progress_note: "Built — needs marketing cadence + beta users", next_action: "Build cadence + onboard 20–30 beta users via LinkedIn CRM", tags: ["Firebase", "Next.js", "Beta", "Subscription"], revenue: null, notes: null },
  { id: "c5", section: "products", title: "Baltimore Creators", sub: "baltimorecreators.com — builder community", status: "active", progress: 65, progress_note: "Exists — needs outreach + newsletter strategy", next_action: "Drive membership via LinkedIn CRM, build newsletter cadence", tags: ["Community", "Newsletter", "LinkedIn"], revenue: null, notes: null },
  { id: "c6", section: "products", title: "The Deli Wire", sub: "thedeliwire.com — deli marketing agency", status: "active", progress: 50, progress_note: "Newsletter running — agency positioning in progress", next_action: "Build outbound marketing strategy + close MDP proposal", tags: ["Boar's Head", "Newsletter", "Agency"], revenue: "Active Revenue", notes: null },
  { id: "c7", section: "deli-wire", title: "Monthly Boar's Head Newsletter", sub: "3 paying subscribers — ongoing", status: "done", progress: 100, progress_note: "Running monthly", next_action: "Maintain monthly cadence, grow subscriber base", tags: ["Boar's Head", "Monthly", "B2B"], revenue: "Active Revenue", notes: null },
  { id: "c8", section: "deli-wire", title: "Maryland Deli Provisions (Adam P.)", sub: "Website + Social + Lead Gen proposal", status: "pending", progress: 10, progress_note: "Newsletter sub — bigger engagement to close", next_action: "Build + send proposal: website, social mgmt, monthly lead gen", tags: ["Website", "Social", "Lead Gen"], revenue: null, notes: null },
  { id: "c9", section: "clients", title: "Dealer Choice Systems", sub: "Furniture SaaS — $1,500/demo performance", status: "active", progress: 90, progress_note: "Instantly running, LinkedIn active, Clay sourcing next", next_action: "Add Clay lead sourcing layer + lock in foolproof workflow", tags: ["Instantly", "Clay", "LinkedIn"], revenue: "Performance — $1,500/demo", notes: null },
  { id: "c10", section: "clients", title: "Convey911", sub: "Public safety tech — largest time investment", status: "blocked", progress: 40, progress_note: "High touch — full universe needs mapping", next_action: "Map full Convey universe as its own dedicated project", tags: ["High Touch", "Content", "Strategy"], revenue: "Active Revenue", notes: null },
  { id: "c11", section: "clients", title: "Convey — HubSpot Pipeline Dashboard", sub: "Opportunity identification tool", status: "active", progress: 35, progress_note: "In progress — build ongoing", next_action: "Finish HubSpot assessment tool for pipeline opportunity ID", tags: ["HubSpot", "Pipeline", "Tool Build"], revenue: null, notes: null },
  { id: "c12", section: "clients", title: "Renee Marchak", sub: "Consulting + VA mgmt + Instantly/Clay", status: "active", progress: 60, progress_note: "Steady — DC system to inherit", next_action: "Apply DC outbound system to Renee once DC is locked in", tags: ["Coaching", "VA Mgmt", "Instantly"], revenue: "$500/mo + VA markup", notes: null },
  { id: "c13", section: "clients", title: "Dave Seel", sub: "Consulting + VA management", status: "done", progress: 100, progress_note: "Steady ongoing", next_action: "Maintain weekly 45-min coaching + VA markup management", tags: ["Coaching", "VA Mgmt"], revenue: "$500/mo + VA markup", notes: null },
  { id: "c14", section: "clients", title: "TASP", sub: "Nonprofit — digital services, maintenance mode", status: "low", progress: 30, progress_note: "Maintenance — PDF task + Q2/Q3 proposals queued", next_action: "Resolve PDF task; website rebuild + tool proposals queued Q2/Q3", tags: ["Monthly Review", "PDF Task"], revenue: "Active Revenue", notes: null },
  { id: "c15", section: "pixilated", title: "Gallery Management & Customer Success", sub: "Under Pixilated — early build started", status: "low", progress: 20, progress_note: "Early stage build — paused for bandwidth", next_action: "Resume build when bandwidth opens", tags: ["Pixilated", "Gallery"], revenue: null, notes: null },
  { id: "c16", section: "pixilated", title: "Aura Photo Booth App", sub: "Under Pixilated — early stage", status: "low", progress: 15, progress_note: "Early stage", next_action: "Revisit when bandwidth opens", tags: ["Pixilated"], revenue: null, notes: null },
  { id: "c17", section: "pixilated", title: "Low-Weight Vibe Apps", sub: "Incremental revenue plays under Pixilated", status: "low", progress: 5, progress_note: "Brainstorming phase only", next_action: "Revisit when bandwidth opens", tags: ["Pixilated", "Low Priority"], revenue: null, notes: null },
  { id: "c18", section: "pixilated", title: "Sideline Sport Supply", sub: "E-commerce dropshipping — athletic equipment", status: "low", progress: 0, progress_note: "Placeholder", next_action: "Tasks TBD — placeholder for future planning", tags: ["E-commerce", "Dropshipping"], revenue: null, notes: null },
];

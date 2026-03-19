

## Plan: Extend GC CRM with Command Center, Idea Inbox, and WhatsApp Outreach

This is a large build. I recommend implementing it in **3 phases** across multiple prompts to keep changes manageable and testable.

---

### Critical Design Decisions

1. **No auth currently exists** in this app. The proposed schemas reference `auth.users(id)` with RLS scoped to `auth.uid()`. Since there's no login/signup flow, I have two options:
   - **Option A**: Build all tables WITHOUT `user_id` and use permissive RLS (matching existing `contacts` table pattern), then add auth later
   - **Option B**: Add authentication first, then build the features

   I recommend **Option A** to ship functionality fast, matching the existing pattern. Auth can be layered on later.

2. **CHECK constraints** will be replaced with validation triggers per project guidelines.

3. **Seeding** will happen client-side on first load (check if table is empty, insert defaults) rather than via migrations, since there's no `user_id` to associate with.

---

### Phase 1: Database + Command Center Tab

**Database migrations:**
- Create `threads` table (without `user_id` for now, permissive RLS like `contacts`)
  - `id text PRIMARY KEY`
  - `section text NOT NULL`
  - `title text NOT NULL`
  - `sub text`, `status text DEFAULT 'active'`, `progress int DEFAULT 0`
  - `progress_note text`, `next_action text`, `tags text[]`, `revenue text`, `notes text`
  - `last_touched timestamptz DEFAULT now()`, `created_at timestamptz DEFAULT now()`
  - Validation trigger for status values and progress range
- Create `ideas` table (same pattern)
  - `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`
  - `type text NOT NULL`, `title text NOT NULL`, `notes text`
  - `executed boolean DEFAULT false`, `created_at timestamptz DEFAULT now()`
  - Validation trigger for type values

**New files:**
- `src/hooks/useThreads.ts` — CRUD hooks for threads table
- `src/hooks/useIdeas.ts` — CRUD hooks for ideas table
- `src/pages/CommandCenter.tsx` — Main tab page with three sub-views:
  - Stats strip (total, active, 90%+ progress, revenue-generating, stale 7+ days)
  - "All" view: card grid grouped by section (gc-core/products/deli-wire/clients/pixilated) with color-coding (purple/teal/orange/green/gray)
  - "Today's Focus" view: priority-sorted list of actionable threads
  - "Idea Inbox" view: quick-capture + filtered card grid
- `src/components/ThreadCard.tsx` — Card component with title, subtitle, status badge, progress bar, next action, tags, revenue tag, staleness dot, touch button
- `src/components/ThreadEditModal.tsx` — Edit modal with status/progress/notes fields
- `src/components/IdeaInbox.tsx` — Quick-capture input + type filter pills + card grid
- Seed logic in hooks: if query returns empty, insert the 18 default threads / no default ideas

**Navigation update:**
- `src/components/AppLayout.tsx` — Add "Command Center" tab to nav

### Phase 2: WhatsApp Outreach Tab

**Database migration:**
- Create `wa_contacts` table (permissive RLS, no `user_id`)
  - `jid text PRIMARY KEY`, `name text NOT NULL`, `sub text`
  - `groups text[]`, `type text NOT NULL`
  - `sent boolean DEFAULT false`, `responded boolean DEFAULT false`
  - `created_at timestamptz DEFAULT now()`
  - Validation trigger for type values

**New files:**
- `src/hooks/useWaContacts.ts` — CRUD hooks + seed logic (35 default contacts)
- `src/pages/WhatsApp.tsx` — Stats strip, filter pills (All/Cross-group/VAs/Creators/Not sent/Sent/Responded), search bar, row list with group badges (red for multi-group), type badges, sent/responded checkboxes, cross-group alert banner, add contact modal
- Navigation update to add WhatsApp tab

### Phase 3: Global Command Bar (Cmd+K)

**New files:**
- `src/components/CommandBar.tsx` — Using the existing `cmdk` dependency, searches across threads, contacts, and wa_contacts simultaneously
- Wire into `App.tsx` with keyboard listener

---

### Visual Style Matching

All new components will use:
- Existing card/badge/button/progress components from `src/components/ui/`
- Same dark theme CSS variables (`bg-card`, `border-border`, `text-muted-foreground`)
- IBM Plex Sans/Mono typography
- Consistent table/card styling from Dashboard and OutreachSection

---

### Summary of Scope

| Phase | New Tables | New Pages | New Components | Est. Complexity |
|-------|-----------|-----------|----------------|----------------|
| 1 | threads, ideas | CommandCenter | ~4 components | Large |
| 2 | wa_contacts | WhatsApp | ~2 components | Medium |
| 3 | — | — | CommandBar | Small |

**Recommendation**: Let me start with Phase 1 (Command Center + Idea Inbox). Shall I proceed?


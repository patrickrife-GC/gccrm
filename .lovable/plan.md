

# CSV Import Feature for LinkedIn Connections

## Overview
Add a CSV import page that parses LinkedIn's "Connections.csv" export and bulk-inserts rows into the `contacts` table. LinkedIn exports typically have columns: `First Name`, `Last Name`, `Email Address`, `Company`, `Position`, `Connected On`, `URL`.

## Implementation

### 1. New page: `src/pages/Import.tsx`
- File upload drop zone (drag-and-drop + click to browse)
- Client-side CSV parsing using a simple custom parser (no new dependency needed — LinkedIn CSVs are straightforward)
- Preview table showing first ~10 parsed rows before import
- "Import" button that bulk-inserts via Supabase
- Progress indicator and success/error toast
- Column mapping: `First Name` → `first_name`, `Last Name` → `last_name`, `Email Address` → `email`, `Company` → `company`, `Position` → `title`, `Connected On` → `connected_on`, `URL` → `linkedin_url`, auto-generate `full_name` from first+last

### 2. Update `src/App.tsx`
- Add route `/import` → `<Import />`

### 3. Update `src/components/AppLayout.tsx`
- Add "Import" nav item with `Upload` icon

### 4. No database changes needed
The `contacts` table already has all required columns. RLS allows all access.

## Technical Details
- Parse CSV client-side, split by newlines and commas (handling quoted fields)
- Batch insert using `supabase.from("contacts").insert(rows)` — Supabase handles bulk inserts efficiently
- Parse LinkedIn date format ("DD Mon YYYY" e.g. "15 Jan 2024") to ISO date string
- Skip duplicate rows by checking `linkedin_url` before insert
- Invalidate `contacts` query cache after successful import


import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/sonner";

interface ParsedContact {
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  company: string;
  title: string;
  connected_on: string | null;
  linkedin_url: string;
}

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        fields.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
  }
  fields.push(current.trim());
  return fields;
}

function parseLinkedInDate(dateStr: string): string | null {
  if (!dateStr) return null;
  const months: Record<string, string> = {
    Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
    Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
  };
  const parts = dateStr.trim().split(" ");
  if (parts.length === 3) {
    const [day, mon, year] = parts;
    const m = months[mon];
    if (m) return `${year}-${m}-${day.padStart(2, "0")}`;
  }
  return null;
}

function parseCSV(text: string): ParsedContact[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim());

  const idx = (name: string) => headers.findIndex((h) => h.includes(name));
  const iFirst = idx("first name");
  const iLast = idx("last name");
  const iEmail = idx("email");
  const iCompany = idx("company");
  const iPosition = idx("position");
  const iConnected = idx("connected on");
  const iUrl = idx("url");

  return lines.slice(1).map((line) => {
    const cols = parseCSVLine(line);
    const g = (i: number) => (i >= 0 ? cols[i] || "" : "");
    const first = g(iFirst);
    const last = g(iLast);
    return {
      first_name: first,
      last_name: last,
      full_name: [first, last].filter(Boolean).join(" "),
      email: g(iEmail),
      company: g(iCompany),
      title: g(iPosition),
      connected_on: parseLinkedInDate(g(iConnected)),
      linkedin_url: g(iUrl),
    };
  }).filter((c) => c.first_name || c.last_name);
}

export default function Import() {
  const [parsed, setParsed] = useState<ParsedContact[]>([]);
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleFile = useCallback((file: File) => {
    setFileName(file.name);
    setDone(false);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setParsed(parseCSV(text));
    };
    reader.readAsText(file);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleImport = async () => {
    if (!parsed.length) return;
    setImporting(true);
    setProgress(0);

    // Fetch existing linkedin_urls to skip duplicates
    const { data: existing } = await supabase
      .from("contacts")
      .select("linkedin_url");
    const existingUrls = new Set((existing || []).map((r) => r.linkedin_url).filter(Boolean));

    const toInsert = parsed.filter((c) => !c.linkedin_url || !existingUrls.has(c.linkedin_url));

    if (!toInsert.length) {
      toast.info("All contacts already exist — nothing to import.");
      setImporting(false);
      return;
    }

    const BATCH = 100;
    let inserted = 0;
    for (let i = 0; i < toInsert.length; i += BATCH) {
      const batch = toInsert.slice(i, i + BATCH);
      const { error } = await supabase.from("contacts").insert(batch);
      if (error) {
        toast.error(`Import error: ${error.message}`);
        setImporting(false);
        return;
      }
      inserted += batch.length;
      setProgress(Math.round((inserted / toInsert.length) * 100));
    }

    queryClient.invalidateQueries({ queryKey: ["contacts"] });
    setImporting(false);
    setDone(true);
    toast.success(`Imported ${inserted} contacts`);
  };

  const preview = parsed.slice(0, 10);
  const skipped = parsed.length > 10 ? parsed.length - 10 : 0;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Import LinkedIn Connections</h1>
        <p className="text-sm text-muted-foreground">
          Upload your <code className="text-xs bg-secondary px-1.5 py-0.5 rounded font-mono">Connections.csv</code> file exported from LinkedIn.
        </p>

        {/* Drop zone */}
        <Card
          className="border-dashed cursor-pointer hover:border-accent transition-colors"
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
        >
          <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
            <Upload className="w-8 h-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {fileName ? (
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4" /> {fileName} — {parsed.length} contacts found
                </span>
              ) : (
                "Drag & drop CSV here, or click to browse"
              )}
            </p>
          </CardContent>
        </Card>
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {/* Preview */}
        {preview.length > 0 && !done && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Preview</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Connected</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.map((c, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{c.full_name}</TableCell>
                      <TableCell>{c.company}</TableCell>
                      <TableCell>{c.title}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{c.connected_on}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {skipped > 0 && (
                <p className="text-xs text-muted-foreground px-4 py-2">+ {skipped} more</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Import button / progress */}
        {parsed.length > 0 && !done && (
          <div className="space-y-3">
            {importing && <Progress value={progress} className="h-2" />}
            <Button onClick={handleImport} disabled={importing} className="w-full">
              {importing ? `Importing… ${progress}%` : `Import ${parsed.length} contacts`}
            </Button>
          </div>
        )}

        {/* Success */}
        {done && (
          <Card className="border-accent">
            <CardContent className="flex items-center gap-3 py-6">
              <CheckCircle className="w-5 h-5 text-accent" />
              <span className="text-sm font-medium">Import complete.</span>
              <Button variant="link" className="ml-auto" onClick={() => navigate("/contacts")}>
                View contacts →
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

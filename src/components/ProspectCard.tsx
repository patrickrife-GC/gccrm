import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ExternalLink, Check, X } from "lucide-react";
import { format, parseISO } from "date-fns";
import type { IcpProspect } from "@/hooks/useIcpStaging";
import { SkipReasonModal } from "./SkipReasonModal";

const SEGMENT_COLORS: Record<string, string> = {
  "Stuck Scaler": "bg-purple-500/20 text-purple-300 border-purple-500/30",
  "Identity Shifter": "bg-teal-500/20 text-teal-300 border-teal-500/30",
  "Busy Expert": "bg-amber-500/20 text-amber-300 border-amber-500/30",
  "Technical Builder": "bg-blue-500/20 text-blue-300 border-blue-500/30",
};

const BRAND_COLORS: Record<string, string> = {
  "Ground Control": "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Ideoloop: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  "Baltimore Creators": "bg-amber-500/20 text-amber-300 border-amber-500/30",
};

function linkedinHandle(url: string | null) {
  if (!url) return null;
  const match = url.match(/linkedin\.com\/in\/([^/?#]+)/);
  return match ? match[1] : url.replace(/https?:\/\/(www\.)?linkedin\.com\//, "");
}

interface ProspectCardProps {
  prospect: IcpProspect;
  onPromote: (p: IcpProspect) => void;
  onSkip: (id: string, reason: string) => void;
}

export function ProspectCard({ prospect, onPromote, onSkip }: ProspectCardProps) {
  const [skipOpen, setSkipOpen] = useState(false);

  const skills: string[] = Array.isArray(prospect.prospect_skills)
    ? prospect.prospect_skills
    : [];
  const shownSkills = skills.slice(0, 4);
  const extraCount = skills.length - 4;

  const location = [prospect.prospect_city, prospect.prospect_country]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <Card className="flex flex-col">
        <CardContent className="pt-5 pb-3 flex-1 space-y-2">
          <h3 className="font-semibold text-base leading-tight">
            {prospect.prospect_full_name || "—"}
          </h3>

          {(prospect.prospect_job_title || prospect.prospect_company_name) && (
            <p className="text-sm text-muted-foreground leading-snug">
              {prospect.prospect_job_title}
              {prospect.prospect_job_title && prospect.prospect_company_name && " · "}
              {prospect.prospect_company_name}
            </p>
          )}

          {location && (
            <p className="text-xs text-muted-foreground">{location}</p>
          )}

          <div className="flex flex-wrap gap-1.5 pt-1">
            {prospect.icp_segment && (
              <Badge
                variant="outline"
                className={SEGMENT_COLORS[prospect.icp_segment] ?? ""}
              >
                {prospect.icp_segment}
              </Badge>
            )}
            {prospect.brand && (
              <Badge
                variant="outline"
                className={BRAND_COLORS[prospect.brand] ?? ""}
              >
                {prospect.brand}
              </Badge>
            )}
          </div>

          {prospect.prospect_linkedin_url && (
            <a
              href={prospect.prospect_linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-400 hover:underline"
            >
              <ExternalLink className="w-3 h-3" />
              {linkedinHandle(prospect.prospect_linkedin_url)}
            </a>
          )}

          {shownSkills.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {shownSkills.map((s) => (
                <span
                  key={s}
                  className="text-[11px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground"
                >
                  {s}
                </span>
              ))}
              {extraCount > 0 && (
                <span className="text-[11px] text-muted-foreground">
                  +{extraCount} more
                </span>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between pt-0 pb-4 px-5">
          <span className="text-[11px] text-muted-foreground">
            {prospect.source_date
              ? `Found ${format(parseISO(prospect.source_date), "MMM d")}`
              : ""}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs"
              onClick={() => setSkipOpen(true)}
            >
              <X className="w-3 h-3 mr-1" /> Skip
            </Button>
            <Button
              size="sm"
              className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => onPromote(prospect)}
            >
              <Check className="w-3 h-3 mr-1" /> Promote
            </Button>
          </div>
        </CardFooter>
      </Card>

      <SkipReasonModal
        open={skipOpen}
        onOpenChange={setSkipOpen}
        prospectName={prospect.prospect_full_name ?? "this prospect"}
        onConfirm={(reason) => {
          onSkip(prospect.id, reason);
          setSkipOpen(false);
        }}
      />
    </>
  );
}

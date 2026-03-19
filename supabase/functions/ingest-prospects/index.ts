import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function parseJsonString(val: unknown): unknown {
  if (typeof val === "string") {
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  }
  return val;
}

function extractLinkedinVanity(urlArrayRaw: unknown): string | null {
  const arr = parseJsonString(urlArrayRaw);
  if (!Array.isArray(arr) || arr.length === 0) return null;
  // Index [1] is the vanity URL; fallback to [0]
  const url = arr.length > 1 ? arr[1] : arr[0];
  if (typeof url !== "string") return null;
  // Ensure it starts with https://
  return url.startsWith("http") ? url : `https://${url}`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Auth: require the VIBE_PROSPECTING_API_KEY as Bearer token
  const VIBE_KEY = Deno.env.get("VIBE_PROSPECTING_API_KEY");
  if (!VIBE_KEY) {
    return new Response(
      JSON.stringify({ error: "VIBE_PROSPECTING_API_KEY not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader || authHeader !== `Bearer ${VIBE_KEY}`) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();

    // Accept either the full Vibe response shape or a direct array of prospects
    let prospects: any[];
    if (body.preview?.preview_data) {
      prospects = body.preview.preview_data;
    } else if (Array.isArray(body)) {
      prospects = body;
    } else if (Array.isArray(body.prospects)) {
      prospects = body.prospects;
    } else {
      return new Response(
        JSON.stringify({ error: "No prospect data found. Expected preview.preview_data, an array, or { prospects: [...] }" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract brand/icp_segment/source_date from top-level if provided
    const defaultBrand = body.brand ?? null;
    const defaultSegment = body.icp_segment ?? null;
    const defaultSourceDate = body.source_date ?? new Date().toISOString().split("T")[0];

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const rows = prospects.map((p: any) => ({
      prospect_full_name: p.prospect_full_name ?? null,
      prospect_job_title: p.prospect_job_title ?? null,
      prospect_company_name: p.prospect_company_name ?? null,
      prospect_company_website: p.prospect_company_website ?? null,
      prospect_linkedin_url: extractLinkedinVanity(
        p.prospect_linkedin_url_array ?? p.prospect_linkedin ?? null
      ),
      prospect_city: p.prospect_city ?? null,
      prospect_region: p.prospect_region_name ?? p.prospect_region ?? null,
      prospect_country: p.prospect_country_name ?? p.prospect_country ?? null,
      prospect_experience: parseJsonString(p.prospect_experience),
      prospect_skills: parseJsonString(p.prospect_skills),
      prospect_job_level_main: p.prospect_job_level_main ?? null,
      prospect_job_department_main: p.prospect_job_department_main ?? null,
      prospect_professional_email_hashed: p.prospect_professional_email_hashed ?? null,
      business_id: p.business_id ?? null,
      brand: p.brand ?? defaultBrand,
      icp_segment: p.icp_segment ?? defaultSegment,
      source: "vibe_prospecting",
      source_date: defaultSourceDate,
      vibe_prospect_id: p.prospect_id ?? null,
    }));

    // Upsert on vibe_prospect_id to deduplicate
    const { data, error } = await supabase
      .from("icp_staging")
      .upsert(rows, { onConflict: "vibe_prospect_id", ignoreDuplicates: true })
      .select("id");

    if (error) {
      console.error("Supabase insert error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        inserted: data?.length ?? 0,
        total_received: prospects.length,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Ingest error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

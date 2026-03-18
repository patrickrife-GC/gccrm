import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { current += '"'; i++ }
      else if (ch === '"') { inQuotes = false }
      else { current += ch }
    } else {
      if (ch === '"') { inQuotes = true }
      else if (ch === ',') { result.push(current); current = '' }
      else { current += ch }
    }
  }
  result.push(current)
  return result
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { url } = await req.json()
    
    // Fetch CSV from URL
    const csvResponse = await fetch(url)
    if (!csvResponse.ok) {
      return new Response(JSON.stringify({ error: `Failed to fetch CSV: ${csvResponse.status}` }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    const csvText = await csvResponse.text()
    const lines = csvText.split('\n').filter(l => l.trim())
    
    // Skip header
    const startIdx = lines[0]?.includes('first_name') ? 1 : 0

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const contacts: any[] = []
    let skipped = 0
    for (let i = startIdx; i < lines.length; i++) {
      const fields = parseCSVLine(lines[i])
      const [first_name, last_name, linkedin_url, email, company, title, connected_on, industry_cluster, full_name] = fields

      // Skip empty rows
      if (!first_name?.trim() && !last_name?.trim() && !full_name?.trim()) {
        skipped++
        continue
      }

      const isValidDate = connected_on && /^\d{4}-\d{2}-\d{2}$/.test(connected_on.trim())

      contacts.push({
        first_name: first_name?.trim() || null,
        last_name: last_name?.trim() || null,
        linkedin_url: linkedin_url?.trim() || null,
        email: email?.trim() || null,
        company: company?.trim() || null,
        title: title?.trim() || null,
        connected_on: isValidDate ? connected_on.trim() : null,
        industry_cluster: industry_cluster?.trim() || null,
        full_name: full_name?.trim() || null,
      })
    }

    // Batch insert 500 at a time
    let inserted = 0
    const errors: string[] = []
    for (let i = 0; i < contacts.length; i += 500) {
      const batch = contacts.slice(i, i + 500)
      const { error } = await supabase.from('contacts').insert(batch)
      if (error) {
        errors.push(`Batch ${Math.floor(i/500)}: ${error.message}`)
      } else {
        inserted += batch.length
      }
    }

    return new Response(JSON.stringify({ inserted, total_parsed: contacts.length, skipped, errors }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

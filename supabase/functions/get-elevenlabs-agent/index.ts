
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { elevenlabs_agent_id } = await req.json()

    if (!elevenlabs_agent_id) {
      throw new Error('ElevenLabs agent ID is required')
    }

    // Get API key from environment variable
    const apiKey = Deno.env.get('ELEVENLABS_API_KEY')
    if (!apiKey) {
      throw new Error('ELEVENLABS_API_KEY is not configured')
    }

    console.log(`Fetching agent details for ID: ${elevenlabs_agent_id}`)

    const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${elevenlabs_agent_id}`, {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || `Failed to fetch agent details: ${response.status}`)
    }

    const agentDetails = await response.json()
    console.log('Successfully retrieved agent details')

    return new Response(JSON.stringify(agentDetails), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in get-elevenlabs-agent:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

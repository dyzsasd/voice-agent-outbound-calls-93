
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
    const { elevenlabs_agent_id, updates } = await req.json()

    if (!elevenlabs_agent_id) {
      throw new Error('ElevenLabs agent ID is required')
    }

    // Get API key from environment variable
    const apiKey = Deno.env.get('ELEVENLABS_API_KEY')
    if (!apiKey) {
      throw new Error('ELEVENLABS_API_KEY is not configured')
    }

    console.log(`Updating agent with ID: ${elevenlabs_agent_id}`)

    const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${elevenlabs_agent_id}`, {
      method: 'PATCH',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || `Failed to update agent: ${response.status}`)
    }

    const updatedAgent = await response.json()
    console.log('Successfully updated agent')

    return new Response(JSON.stringify(updatedAgent), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in update-elevenlabs-agent:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

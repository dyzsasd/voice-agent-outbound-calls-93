
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
    
    console.log(`Request payload:`, JSON.stringify({ elevenlabs_agent_id, updates }, null, 2))

    if (!elevenlabs_agent_id) {
      throw new Error('ElevenLabs agent ID is required')
    }

    // Get API key from environment variable
    const apiKey = Deno.env.get('ELEVENLABS_API_KEY')
    if (!apiKey) {
      throw new Error('ELEVENLABS_API_KEY is not configured')
    }

    console.log(`Updating agent with ID: ${elevenlabs_agent_id}`)
    console.log(`Update payload:`, JSON.stringify(updates, null, 2))

    const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${elevenlabs_agent_id}`, {
      method: 'PATCH',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    })

    const responseData = await response.text()
    console.log(`ElevenLabs API response status: ${response.status}`)
    console.log(`ElevenLabs API response body:`, responseData)

    if (!response.ok) {
      let errorDetail = "Unknown error"
      try {
        const errorJson = JSON.parse(responseData)
        errorDetail = errorJson.detail || errorJson.message || JSON.stringify(errorJson)
      } catch (e) {
        errorDetail = responseData || `HTTP error: ${response.status}`
      }
      
      throw new Error(`Failed to update agent: ${errorDetail}`)
    }

    const updatedAgent = responseData ? JSON.parse(responseData) : null
    console.log('Successfully updated agent')

    return new Response(JSON.stringify(updatedAgent), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in update-elevenlabs-agent:', error.message || error)
    if (error.stack) {
      console.error('Stack trace:', error.stack)
    }
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "Unknown error occurred",
        details: error.toString()
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

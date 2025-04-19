
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

    // Only send the necessary fields to the ElevenLabs API
    const minimalUpdates = {}
    
    if (updates.conversation_config?.agent) {
      minimalUpdates.conversation_config = { agent: {} }
      
      // Handle prompt and LLM model
      if (updates.conversation_config.agent.prompt) {
        minimalUpdates.conversation_config.agent.prompt = {}
        
        if (updates.conversation_config.agent.prompt.prompt !== undefined) {
          minimalUpdates.conversation_config.agent.prompt.prompt = updates.conversation_config.agent.prompt.prompt
        }
        
        if (updates.conversation_config.agent.prompt.llm !== undefined) {
          minimalUpdates.conversation_config.agent.prompt.llm = updates.conversation_config.agent.prompt.llm
        }
      }
      
      // Handle first message
      if (updates.conversation_config.agent.first_message !== undefined) {
        minimalUpdates.conversation_config.agent.first_message = updates.conversation_config.agent.first_message
      }
      
      // Handle language
      if (updates.conversation_config.agent.language !== undefined) {
        minimalUpdates.conversation_config.agent.language = updates.conversation_config.agent.language
      }
    }

    console.log(`Updating agent with ID: ${elevenlabs_agent_id}`)
    console.log(`Minimal update payload:`, JSON.stringify(minimalUpdates, null, 2))

    // Log the actual request we're about to send to ElevenLabs
    console.log(`ElevenLabs API request:`, JSON.stringify({
      method: 'PATCH',
      url: `https://api.elevenlabs.io/v1/convai/agents/${elevenlabs_agent_id}`,
      body: minimalUpdates
    }, null, 2))

    const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${elevenlabs_agent_id}`, {
      method: 'PATCH',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(minimalUpdates)
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

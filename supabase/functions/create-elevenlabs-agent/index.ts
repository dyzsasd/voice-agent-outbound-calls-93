
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Log incoming request
  console.log(`Request received: ${req.method} ${req.url}`)
  
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request (CORS preflight)')
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Check for API key presence
    const apiKey = Deno.env.get('ELEVENLABS_API_KEY')
    console.log(`API key present: ${!!apiKey}`)
    if (!apiKey) {
      console.error('ELEVENLABS_API_KEY is not configured')
      throw new Error('ELEVENLABS_API_KEY is not configured')
    }

    // Log request body
    const body = await req.json()
    console.log('Request payload:', JSON.stringify(body))
    
    const { name } = body
    if (!name) {
      console.error('Name is required but not provided')
      throw new Error('Name is required')
    }

    // According to ElevenLabs API documentation for creating assistant
    // https://api.elevenlabs.io/docs#/voice-assistants/create_ai_assistant_v1_assistants_post
    console.log(`Sending request to ElevenLabs API to create agent: ${name}`)
    const response = await fetch('https://api.elevenlabs.io/v1/assistants', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        name: name,
        description: `Voice agent named ${name}`,
        // Added additional required fields based on ElevenLabs API
        initial_message: `Hi, I'm ${name}. How can I help you today?`,
        voice_id: "21m00Tcm4TlvDq8ikWAM", // Default voice Rachel
        model_id: "eleven_multilingual_v2", // Modern multilingual model
      }),
    });

    // Log response status
    console.log(`ElevenLabs API response status: ${response.status}`)
    
    // Parse response body
    const responseText = await response.text()
    console.log(`ElevenLabs API response body: ${responseText}`)
    
    if (!response.ok) {
      try {
        const error = JSON.parse(responseText)
        console.error('ElevenLabs API error:', error)
        throw new Error(error.detail || `ElevenLabs API error: ${response.status}`)
      } catch (parseError) {
        console.error('Failed to parse error response:', parseError)
        throw new Error(`ElevenLabs API error: ${response.status} - ${responseText}`)
      }
    }

    // Parse success response
    let data
    try {
      data = JSON.parse(responseText)
      console.log('Successfully created ElevenLabs agent:', data)
    } catch (parseError) {
      console.error('Failed to parse success response:', parseError)
      throw new Error('Failed to parse ElevenLabs response')
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in edge function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message, 
        stack: error.stack 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

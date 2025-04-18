
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// List of supported language codes
const SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'de', 'it', 'pt', 'pl', 'hi', 'ar', 'zh', 'ja', 'ko', 'nl', 'ru', 'tr', 'cs', 'da', 'fi', 'el', 'hu', 'id', 'no', 'ro', 'sk', 'sv', 'th', 'uk', 'vi'];

// List of supported LLM models
const SUPPORTED_MODELS = [
  'gpt-4o-mini',
  'gpt-4o',
  'gpt-4-turbo',
  'gpt-3.5-turbo',
  'gemini-1.5-pro',
  'gemini-1.5-flash',
  'claude-3-7-sonnet',
  'claude-3-5-sonnet',
  'claude-3-haiku'
];

// Default voice ID (Rachel)
const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

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

    // Parse and validate request body
    const body = await req.json()
    console.log('Request payload:', JSON.stringify(body))
    
    const { 
      name, 
      firstMessage = `Hi, I'm ${body.name}. How can I help you today?`, 
      language = 'en', 
      prompt = '', 
      llmModel = 'gpt-4o-mini', 
      voiceId = DEFAULT_VOICE_ID 
    } = body;
    
    if (!name) {
      console.error('Name is required but not provided')
      throw new Error('Name is required')
    }

    // Validate language
    if (!SUPPORTED_LANGUAGES.includes(language)) {
      console.error(`Invalid language: ${language}. Supported languages: ${SUPPORTED_LANGUAGES.join(', ')}`)
      throw new Error(`Invalid language: ${language}`)
    }

    // Validate LLM model
    if (!SUPPORTED_MODELS.includes(llmModel)) {
      console.error(`Invalid LLM model: ${llmModel}. Supported models: ${SUPPORTED_MODELS.join(', ')}`)
      throw new Error(`Invalid LLM model: ${llmModel}`)
    }

    // Construct the request payload according to the ElevenLabs API spec
    const requestPayload = {
      conversation_config: {
        agent: {
          first_message: firstMessage,
          language: language,
          prompt: {
            prompt: prompt,
            llm: llmModel
          }
        },
        tts: {
          voice_id: voiceId
        }
      },
      name: name,
      description: `Voice agent named ${name}`
    };

    console.log('Sending payload to ElevenLabs API:', JSON.stringify(requestPayload, null, 2))
    
    // Make the API request to ElevenLabs
    console.log(`Sending request to ElevenLabs API to create agent: ${name}`)
    const response = await fetch('https://api.elevenlabs.io/v1/convai/agents/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify(requestPayload),
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

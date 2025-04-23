
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./config.ts";
import { Database } from "./database.ts";
import { ElevenLabsAPI } from "./elevenlabs-api.ts";
import { ConversationService } from "./conversation-service.ts";
import type { RequestData } from "./types.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const elevenlabsApiKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (!elevenlabsApiKey) {
      console.error('Missing ELEVENLABS_API_KEY environment variable');
      throw new Error('ElevenLabs API key not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    const db = new Database(supabaseUrl, supabaseServiceKey);
    const elevenlabs = new ElevenLabsAPI(elevenlabsApiKey);
    const conversationService = new ConversationService(db, elevenlabs);

    const requestData = await req.json() as RequestData;
    console.log('Request data:', JSON.stringify(requestData));
    
    const { agent_id } = requestData;
    if (!agent_id) {
      console.error('Missing agent_id in request');
      throw new Error('Missing agent_id parameter');
    }

    console.log(`Syncing conversations for agent_id (Supabase ID): ${agent_id}`);

    // Get the ElevenLabs agent ID
    const agentData = await db.getAgent(agent_id);
    if (!agentData?.elevenlabs_agent_id) {
      throw new Error('Could not find ElevenLabs agent ID');
    }

    const elevenlabsAgentId = agentData.elevenlabs_agent_id;
    console.log(`Found ElevenLabs agent ID: ${elevenlabsAgentId}`);

    const newConversations = await conversationService.syncConversations(agent_id, elevenlabsAgentId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Synced ${newConversations.length} new conversations`,
        newConversations 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error syncing conversations:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack,
        time: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

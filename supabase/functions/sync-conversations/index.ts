
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./config.ts";
import { Database } from "./database.ts";
import { ElevenLabsAPI } from "./elevenlabs-api.ts";
import type { ConversationDetail, ConversationResponse, RequestData } from "./types.ts";

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

    // Fetch existing conversations
    const existingConversations = await db.getExistingConversations(agent_id);
    console.log(`Found ${existingConversations.length} existing conversations in database`);
    const existingIds = new Set(existingConversations.map(c => c.conversation_id));

    // Fetch conversations from ElevenLabs
    console.log(`Fetching conversations from ElevenLabs API for elevenlabs_agent_id: ${elevenlabsAgentId}`);
    const response = await elevenlabs.fetchConversations(elevenlabsAgentId);
    console.log(`ElevenLabs API response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error details: ${errorText}`);
      throw new Error(`Failed to fetch conversations: ${response.statusText}. Details: ${errorText}`);
    }

    const data = await response.json() as ConversationResponse;
    console.log(`Received ${data.conversations?.length || 0} conversations from ElevenLabs API`);
    
    if (!data.conversations || !Array.isArray(data.conversations)) {
      console.error('Unexpected API response format:', JSON.stringify(data));
      throw new Error('Invalid API response format');
    }

    const newConversations = [];

    // Process each conversation
    for (const conv of data.conversations) {
      console.log(`Processing conversation: ${conv.conversation_id}`);
      
      if (!existingIds.has(conv.conversation_id)) {
        try {
          // Fetch detailed conversation data
          console.log(`Fetching details for conversation: ${conv.conversation_id}`);
          const detailResponse = await elevenlabs.fetchConversationDetails(conv.conversation_id);

          if (!detailResponse.ok) {
            const detailErrorText = await detailResponse.text();
            console.error(`Error fetching conversation details: ${detailErrorText}`);
            continue;
          }

          const detail = await detailResponse.json() as ConversationDetail;
          console.log(`Received details for conversation: ${conv.conversation_id}, status: ${detail.status}`);
          
          // Only proceed if the conversation status is 'done' or 'failed'
          const status = detail.status.toLowerCase();
          if (status !== 'done' && status !== 'failed') {
            console.log(`Skipping conversation ${conv.conversation_id} with status: ${status}`);
            continue;
          }

          const call_id = detail.metadata?.phone_call?.call_sid || null;
          console.log(`Call ID from metadata: ${call_id || 'none'}`);

          // Find associated task
          const task = await db.findTaskByCallId(call_id);
          console.log(`Associated task ID: ${task?.id || 'none'}`);

          // Insert conversation
          await db.insertConversation(
            conv.conversation_id,
            call_id,
            agent_id,
            task?.id || null,
            detail
          );
          
          console.log(`Successfully inserted conversation: ${conv.conversation_id}`);

          // Update task if found
          if (task?.id) {
            const taskStatus = await db.updateTaskStatus(task.id, conv.conversation_id, status);
            console.log(`Successfully updated task ${task.id} with conversation_id ${conv.conversation_id} and status ${taskStatus}`);
          }

          newConversations.push(conv.conversation_id);
        } catch (convError) {
          console.error(`Error processing conversation ${conv.conversation_id}:`, convError);
        }
      } else {
        console.log(`Conversation ${conv.conversation_id} already exists in database, skipping`);
      }
    }

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

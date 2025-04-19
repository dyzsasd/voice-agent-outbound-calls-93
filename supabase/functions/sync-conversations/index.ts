import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const requestData = await req.json();
    console.log('Request data:', JSON.stringify(requestData));
    
    const { agent_id } = requestData;
    if (!agent_id) {
      console.error('Missing agent_id in request');
      throw new Error('Missing agent_id parameter');
    }

    console.log(`Syncing conversations for agent_id (Supabase ID): ${agent_id}`);

    // Get the ElevenLabs agent ID from the Supabase agent ID
    const { data: agentData, error: agentError } = await supabase
      .from('agents')
      .select('elevenlabs_agent_id')
      .eq('id', agent_id)
      .single();

    if (agentError || !agentData?.elevenlabs_agent_id) {
      console.error('Error fetching ElevenLabs agent ID:', agentError || 'No elevenlabs_agent_id found');
      throw new Error('Could not find ElevenLabs agent ID');
    }

    const elevenlabsAgentId = agentData.elevenlabs_agent_id;
    console.log(`Found ElevenLabs agent ID: ${elevenlabsAgentId}`);

    // Fetch existing conversations for this agent from our database
    const { data: existingConversations, error: dbError } = await supabase
      .from('conversations')
      .select('conversation_id')
      .eq('agent_id', agent_id);

    if (dbError) {
      console.error('Database error when fetching existing conversations:', dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }

    console.log(`Found ${existingConversations?.length || 0} existing conversations in database`);
    const existingIds = new Set(existingConversations?.map(c => c.conversation_id) || []);

    // Log the API request we're about to make
    console.log(`Fetching conversations from ElevenLabs API for elevenlabs_agent_id: ${elevenlabsAgentId}`);
    console.log(`API URL: https://api.elevenlabs.io/v1/convai/conversations?agent_id=${elevenlabsAgentId}`);

    // Fetch conversations from ElevenLabs API using the elevenlabs_agent_id
    const response = await fetch(`https://api.elevenlabs.io/v1/convai/conversations?agent_id=${elevenlabsAgentId}`, {
      headers: {
        'xi-api-key': elevenlabsApiKey,
      },
    });

    console.log(`ElevenLabs API response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error details: ${errorText}`);
      throw new Error(`Failed to fetch conversations: ${response.statusText}. Details: ${errorText}`);
    }

    const data = await response.json();
    console.log(`Received ${data?.conversations?.length || 0} conversations from ElevenLabs API`);
    
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
          const detailResponse = await fetch(
            `https://api.elevenlabs.io/v1/convai/conversations/${conv.conversation_id}`,
            {
              headers: {
                'xi-api-key': elevenlabsApiKey,
              },
            }
          );

          if (!detailResponse.ok) {
            const detailErrorText = await detailResponse.text();
            console.error(`Error fetching conversation details: ${detailErrorText}`);
            continue;
          }

          const detail = await detailResponse.json();
          console.log(`Received details for conversation: ${conv.conversation_id}, status: ${detail.status}`);
          
          const call_id = detail.metadata?.phone_call?.call_sid || null;
          console.log(`Call ID from metadata: ${call_id || 'none'}`);

          // Find associated task if it exists
          const { data: tasks, error: tasksError } = await supabase
            .from('tasks')
            .select('id')
            .eq('call_id', call_id)
            .maybeSingle();

          if (tasksError) {
            console.error(`Error fetching task for call_id ${call_id}:`, tasksError);
          }

          console.log(`Associated task ID: ${tasks?.id || 'none'}`);

          // Map ElevenLabs conversation status to task status
          let taskStatus;
          const conversationStatus = detail.status.toLowerCase();
          switch (conversationStatus) {
            case 'done':
              taskStatus = 'finished';
              break;
            case 'failed':
              taskStatus = 'failed';
              break;
            case 'in_progress':
            case 'processing':
              taskStatus = 'processing';
              break;
            default:
              taskStatus = 'unknown';
              console.log(`Unmapped conversation status "${detail.status}" defaulting to "unknown"`);
          }

          console.log(`Mapped conversation status "${detail.status}" to task status "${taskStatus}"`);

          // Insert new conversation
          const { error: insertError } = await supabase
            .from('conversations')
            .insert({
              conversation_id: conv.conversation_id,
              call_id,
              agent_id,
              task_id: tasks?.id || null,
              status: detail.status,
              transcript: detail.transcript,
              metadata: detail.metadata,
              analysis: detail.analysis
            });

          if (insertError) {
            console.error(`Error inserting conversation ${conv.conversation_id}:`, insertError);
          } else {
            console.log(`Successfully inserted conversation: ${conv.conversation_id}`);
          }

          // Update task with conversation_id and new status if found
          if (tasks?.id) {
            console.log(`Updating task ${tasks.id} status to: ${taskStatus}`);
            const { error: updateError } = await supabase
              .from('tasks')
              .update({ 
                conversation_id: conv.conversation_id,
                status: taskStatus 
              })
              .eq('id', tasks.id);
              
            if (updateError) {
              console.error(`Error updating task ${tasks.id}:`, updateError);
            } else {
              console.log(`Successfully updated task ${tasks.id} with conversation_id ${conv.conversation_id} and status ${taskStatus}`);
            }
          }
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

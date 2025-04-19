
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { agent_id } = await req.json();

    // Fetch existing conversations for this agent from our database
    const { data: existingConversations } = await supabase
      .from('conversations')
      .select('conversation_id')
      .eq('agent_id', agent_id);

    const existingIds = new Set(existingConversations?.map(c => c.conversation_id) || []);

    // Fetch conversations from ElevenLabs API
    const response = await fetch('https://api.elevenlabs.io/v1/convai/conversations?agent_id=' + agent_id, {
      headers: {
        'xi-api-key': elevenlabsApiKey || '',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch conversations: ${response.statusText}`);
    }

    const data = await response.json();
    const newConversations = [];

    // Process each conversation
    for (const conv of data.conversations) {
      if (!existingIds.has(conv.conversation_id)) {
        // Fetch detailed conversation data
        const detailResponse = await fetch(
          `https://api.elevenlabs.io/v1/convai/conversations/${conv.conversation_id}`,
          {
            headers: {
              'xi-api-key': elevenlabsApiKey || '',
            },
          }
        );

        if (detailResponse.ok) {
          const detail = await detailResponse.json();
          const call_id = detail.metadata?.phone_call?.call_sid || null;

          // Find associated task if it exists
          const { data: tasks } = await supabase
            .from('tasks')
            .select('id')
            .eq('call_id', call_id)
            .single();

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

          if (!insertError) {
            newConversations.push(conv.conversation_id);
          }

          // Update task with conversation_id if found
          if (tasks?.id) {
            await supabase
              .from('tasks')
              .update({ conversation_id: conv.conversation_id })
              .eq('id', tasks.id);
          }
        }
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
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

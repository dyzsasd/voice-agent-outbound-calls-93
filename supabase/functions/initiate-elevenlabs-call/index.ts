
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { taskId, agentId, phoneNumber } = await req.json();
    
    if (!taskId || !agentId || !phoneNumber) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const elevenlabsApiKey = Deno.env.get('ELEVENLABS_API_KEY') || '';

    if (!elevenlabsApiKey) {
      return new Response(
        JSON.stringify({ error: "ElevenLabs API key is not configured" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a Supabase client with the service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the agent details first
    const { data: agentData, error: agentError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single();

    if (agentError || !agentData) {
      console.error('Error fetching agent:', agentError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch agent information" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the user profile for phone_number_id
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('phone_number')
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch phone number information" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const agentPhoneNumberId = profileData?.phone_number;

    if (!agentPhoneNumberId) {
      return new Response(
        JSON.stringify({ error: "Agent phone number ID not found" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Initiating call with:', {
      agent_id: agentData.elevenlabs_agent_id,
      agent_phone_number_id: agentPhoneNumberId,
      to_number: phoneNumber
    });

    // Call the ElevenLabs API to initiate the outbound call
    const response = await fetch('https://api.elevenlabs.io/v1/convai/twilio/outbound_call', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': elevenlabsApiKey
      },
      body: JSON.stringify({
        agent_id: agentData.elevenlabs_agent_id,
        agent_phone_number_id: agentPhoneNumberId,
        to_number: phoneNumber
      })
    });

    const elevenlabsData = await response.json();

    if (!response.ok) {
      console.error('ElevenLabs API error:', elevenlabsData);
      return new Response(
        JSON.stringify({ error: "Failed to initiate call via ElevenLabs API", details: elevenlabsData }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update the task with the conversation ID and status
    const { error: updateError } = await supabase
      .from('tasks')
      .update({
        elevenlabs_conversation_id: elevenlabsData.callSid || null,
        status: 'processing'
      })
      .eq('id', taskId);

    if (updateError) {
      console.error('Error updating task:', updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update task status", details: updateError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Call initiated successfully",
        callSid: elevenlabsData.callSid
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in initiate-elevenlabs-call function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

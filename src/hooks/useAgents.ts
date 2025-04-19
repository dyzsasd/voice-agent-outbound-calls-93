
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

// Define the agent type with additional properties
interface Agent {
  id: string;
  name: string;
  elevenlabs_agent_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  language?: string;
  llm_model?: string;
}

interface CreateAgentParams {
  name: string;
  elevenlabsAgentId: string;
  language?: string;
  llmModel?: string;
}

// Function to fetch agent details from ElevenLabs
const fetchElevenLabsAgentDetails = async (agentId: string) => {
  const apiKey = localStorage.getItem('elevenlabs_api_key');
  if (!apiKey) {
    throw new Error('ElevenLabs API key not found');
  }

  const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
    method: 'GET',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch agent details');
  }

  return response.json();
};

export const useAgents = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: agents, isLoading } = useQuery({
    queryKey: ["agents", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Agent[];
    },
    enabled: !!user?.id,
  });

  // Query for ElevenLabs agent details
  const getAgentDetails = useQuery({
    queryKey: ['elevenlabs_agent_details'],
    queryFn: () => {
      throw new Error('Agent ID is required');
    },
    enabled: false,
  });

  const createAgent = useMutation({
    mutationFn: async ({ 
      name, 
      elevenlabsAgentId, 
      language = 'en', 
      llmModel = 'gpt-4o-mini'
    }: CreateAgentParams) => {
      if (!user?.id) throw new Error("User must be logged in to create an agent");
      
      const { data, error } = await supabase
        .from("agents")
        .insert({ 
          name, 
          elevenlabs_agent_id: elevenlabsAgentId,
          user_id: user.id,
          language,
          llm_model: llmModel,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Agent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });

  // Method to fetch specific agent details from ElevenLabs
  const fetchAgentDetailsFromElevenLabs = async (agentId: string) => {
    return fetchElevenLabsAgentDetails(agentId);
  };

  return {
    agents,
    isLoading,
    createAgent,
    fetchAgentDetailsFromElevenLabs,
  };
};

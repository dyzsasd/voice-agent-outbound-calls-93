
import { useQuery } from "@tanstack/react-query";
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

  const { data: agents, isLoading, refetch } = useQuery({
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

  // Method to fetch specific agent details from ElevenLabs
  const fetchAgentDetailsFromElevenLabs = async (agentId: string) => {
    return fetchElevenLabsAgentDetails(agentId);
  };

  return {
    agents,
    isLoading,
    refetch,
    fetchAgentDetailsFromElevenLabs,
  };
};

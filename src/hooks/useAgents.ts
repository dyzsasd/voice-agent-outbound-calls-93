
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
}

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

  // Method to fetch agent details from ElevenLabs using our edge function
  const fetchAgentDetailsFromElevenLabs = async (elevenlabs_agent_id: string) => {
    const { data, error } = await supabase.functions.invoke('get-elevenlabs-agent', {
      body: { elevenlabs_agent_id }
    });

    if (error) throw error;
    return data;
  };

  return {
    agents,
    isLoading,
    refetch,
    fetchAgentDetailsFromElevenLabs
  };
};

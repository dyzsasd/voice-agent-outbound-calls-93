
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
  first_message?: string;
  prompt?: string;
}

interface CreateAgentParams {
  name: string;
  elevenlabsAgentId: string;
  language?: string;
  llmModel?: string;
  firstMessage?: string;
  prompt?: string;
}

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

  const createAgent = useMutation({
    mutationFn: async ({ 
      name, 
      elevenlabsAgentId, 
      language = 'en', 
      llmModel = 'gpt-4o-mini',
      firstMessage = '',
      prompt = ''
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
          first_message: firstMessage,
          prompt
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

  return {
    agents,
    isLoading,
    createAgent,
  };
};

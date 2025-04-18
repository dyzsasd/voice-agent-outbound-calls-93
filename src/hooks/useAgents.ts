import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

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
      return data;
    },
    enabled: !!user?.id,
  });

  const createAgent = useMutation({
    mutationFn: async ({ name, elevenlabsAgentId }: { name: string; elevenlabsAgentId: string }) => {
      if (!user?.id) throw new Error("User must be logged in to create an agent");
      
      const { data, error } = await supabase
        .from("agents")
        .insert({ 
          name, 
          elevenlabs_agent_id: elevenlabsAgentId,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
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

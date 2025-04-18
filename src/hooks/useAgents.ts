
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
      const { data, error } = await supabase
        .from("agents")
        .insert({ name, elevenlabs_agent_id: elevenlabsAgentId })
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

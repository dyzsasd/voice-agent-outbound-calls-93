
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

export const useTasks = (agentId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["tasks", agentId],
    queryFn: async () => {
      const query = supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (agentId) {
        query.eq("agent_id", agentId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const createTask = useMutation({
    mutationFn: async ({ agentId, toPhoneNumber }: { agentId: string; toPhoneNumber: string }) => {
      const { data, error } = await supabase
        .from("tasks")
        .insert({ agent_id: agentId, to_phone_number: toPhoneNumber })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  return {
    tasks,
    isLoading,
    createTask,
  };
};


import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";

export const useTasks = (agentId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
    mutationFn: async ({ 
      agentId, 
      toPhoneNumber, 
      name 
    }: { 
      agentId: string; 
      toPhoneNumber: string; 
      name?: string 
    }) => {
      const { data, error } = await supabase
        .from("tasks")
        .insert({ 
          agent_id: agentId, 
          to_phone_number: toPhoneNumber,
          name: name || null,
          status: 'idle'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const runTask = useMutation({
    mutationFn: async ({ 
      taskId,
      agentId,
      phoneNumber
    }: { 
      taskId: string;
      agentId: string;
      phoneNumber: string;
    }) => {
      try {
        const { data, error } = await supabase.functions.invoke('initiate-elevenlabs-call', {
          body: { taskId, agentId, phoneNumber }
        });

        if (error) throw error;
        return data;
      } catch (error) {
        console.error("Error calling edge function:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Task started",
        description: "The call has been initiated successfully"
      });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to start task",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  });

  return {
    tasks,
    isLoading,
    createTask,
    runTask
  };
};

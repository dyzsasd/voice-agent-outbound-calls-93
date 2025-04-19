
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { useAgents } from "@/hooks/useAgents";
import { useTasks } from "@/hooks/useTasks";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { AgentConfigurationForm } from "@/components/AgentConfigurationForm";
import { CreateTaskForm } from "@/components/agent/CreateTaskForm";
import { TaskList } from "@/components/agent/TaskList";

const Agent = () => {
  const { id } = useParams<{ id: string }>();
  const { agents, fetchAgentDetailsFromElevenLabs, updateAgentInElevenLabs } = useAgents();
  const { tasks, createTask, runTask } = useTasks(id);
  const { toast } = useToast();
  const [agentDetails, setAgentDetails] = useState<any>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [runningTasks, setRunningTasks] = useState<Record<string, boolean>>({});

  const agent = agents?.find((a) => a.id === id);

  useEffect(() => {
    if (agent && !agentDetails) {
      setIsLoadingDetails(true);
      fetchAgentDetailsFromElevenLabs(agent.elevenlabs_agent_id)
        .then((data) => {
          setAgentDetails(data);
        })
        .catch((error) => {
          console.error("Failed to fetch agent details:", error);
          toast({
            title: "Failed to fetch agent details",
            description: error.message,
            variant: "destructive",
          });
        })
        .finally(() => {
          setIsLoadingDetails(false);
        });
    }
  }, [agent, agentDetails, fetchAgentDetailsFromElevenLabs, toast]);

  const handleUpdateConfiguration = async (updates: any) => {
    if (!agent) return;
    
    setIsUpdating(true);
    try {
      const updatedAgent = await updateAgentInElevenLabs(agent.elevenlabs_agent_id, updates);
      setAgentDetails(updatedAgent);
      toast({ title: "Agent configuration updated successfully" });
    } catch (error) {
      console.error("Failed to update agent:", error);
      toast({
        title: "Failed to update agent configuration",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateTask = async (taskName: string, phoneNumber: string) => {
    if (!id) return;

    try {
      await createTask.mutateAsync({ 
        agentId: id, 
        toPhoneNumber: phoneNumber,
        name: taskName || undefined 
      });
      toast({ title: "Task created successfully" });
    } catch (error) {
      toast({
        title: "Failed to create task",
        description: "An error occurred while creating the task",
        variant: "destructive",
      });
    }
  };

  const handleRunTask = async (taskId: string, phoneNumber: string) => {
    if (!id) return;

    setRunningTasks(prev => ({ ...prev, [taskId]: true }));
    try {
      await runTask.mutateAsync({
        taskId,
        agentId: id,
        phoneNumber
      });
    } finally {
      setRunningTasks(prev => ({ ...prev, [taskId]: false }));
    }
  };

  if (!agent) {
    return <div>Agent not found</div>;
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{agent.name}</h1>
          <p className="text-muted-foreground">Agent ID: {agent.elevenlabs_agent_id}</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Agent Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingDetails ? (
              <div>Loading configuration...</div>
            ) : agentDetails ? (
              <AgentConfigurationForm
                agentDetails={agentDetails}
                isUpdating={isUpdating}
                onUpdate={handleUpdateConfiguration}
              />
            ) : (
              <div>Failed to load agent configuration</div>
            )}
          </CardContent>
        </Card>

        <div className="mb-8">
          <CreateTaskForm 
            onSubmit={handleCreateTask}
            isCreating={createTask.isPending}
          />
        </div>

        <TaskList 
          tasks={tasks || []}
          onRunTask={handleRunTask}
          runningTasks={runningTasks}
          isRunningTask={runTask.isPending}
        />
      </div>
    </Layout>
  );
};

export default Agent;

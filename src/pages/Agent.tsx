
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { useAgents } from "@/hooks/useAgents";
import { useTasks } from "@/hooks/useTasks";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { AgentConfigurationForm } from "@/components/AgentConfigurationForm";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const Agent = () => {
  const { id } = useParams<{ id: string }>();
  const { agents, fetchAgentDetailsFromElevenLabs, updateAgentInElevenLabs } = useAgents();
  const { tasks, createTask } = useTasks(id);
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [taskName, setTaskName] = useState("");
  const [agentDetails, setAgentDetails] = useState<any>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

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

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    // Validate phone number format (basic validation)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number with country code (e.g., +1234567890)",
        variant: "destructive",
      });
      return;
    }

    try {
      await createTask.mutateAsync({ 
        agentId: id, 
        toPhoneNumber: phoneNumber,
        name: taskName || undefined 
      });
      toast({ title: "Task created successfully" });
      setPhoneNumber("");
      setTaskName("");
    } catch (error) {
      toast({
        title: "Failed to create task",
        description: "An error occurred while creating the task",
        variant: "destructive",
      });
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
          <Card>
            <CardHeader>
              <CardTitle>Create New Task</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <Label htmlFor="taskName">Task Name (Optional)</Label>
                  <Input
                    id="taskName"
                    type="text"
                    placeholder="Enter task name (optional)"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="Enter phone number with country code (e.g., +1234567890)"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    className="mt-2"
                  />
                </div>
                <Button type="submit" disabled={createTask.isPending} className="w-full">
                  Create Task
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4">
          <h2 className="text-2xl font-bold">Tasks</h2>
          {tasks?.map((task) => (
            <Card key={task.id}>
              <CardHeader>
                <CardTitle>Task for {task.to_phone_number}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>Status: {task.status}</div>
                  <div>Created: {new Date(task.created_at).toLocaleString()}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Agent;

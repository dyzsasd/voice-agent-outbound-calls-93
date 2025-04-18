
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { useAgents } from "@/hooks/useAgents";
import { useTasks } from "@/hooks/useTasks";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const Agent = () => {
  const { id } = useParams<{ id: string }>();
  const { agents } = useAgents();
  const { tasks, createTask } = useTasks(id);
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState("");

  const agent = agents?.find((a) => a.id === id);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      await createTask.mutateAsync({ agentId: id, toPhoneNumber: phoneNumber });
      toast({ title: "Task created successfully" });
      setPhoneNumber("");
    } catch (error) {
      toast({
        title: "Failed to create task",
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
          <p className="text-muted-foreground">ElevenLabs Agent ID: {agent.elevenlabs_agent_id}</p>
        </div>

        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Create New Task</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateTask} className="flex gap-4">
                <Input
                  type="tel"
                  placeholder="Enter phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
                <Button type="submit" disabled={createTask.isPending}>
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

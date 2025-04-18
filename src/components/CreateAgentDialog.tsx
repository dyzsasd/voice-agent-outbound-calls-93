
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAgents } from "@/hooks/useAgents";
import { PlusCircle } from "lucide-react";

export function CreateAgentDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { createAgent } = useAgents();
  const [name, setName] = useState("");
  const [elevenlabsAgentId, setElevenlabsAgentId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAgent.mutateAsync({ name, elevenlabsAgentId });
      toast({ title: "Agent created successfully" });
      setOpen(false);
      setName("");
      setElevenlabsAgentId("");
    } catch (error) {
      toast({
        title: "Failed to create agent",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Agent
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Agent</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Agent Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter agent name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="elevenlabsAgentId">ElevenLabs Agent ID</Label>
            <Input
              id="elevenlabsAgentId"
              value={elevenlabsAgentId}
              onChange={(e) => setElevenlabsAgentId(e.target.value)}
              placeholder="Enter ElevenLabs Agent ID"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={createAgent.isPending}>
            Create Agent
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

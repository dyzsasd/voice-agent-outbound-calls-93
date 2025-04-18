
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAgents } from "@/hooks/useAgents";
import { PlusCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function CreateAgentDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { createAgent } = useAgents();
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Create ElevenLabs agent
      const { data: elevenlabsAgent, error: elevenlabsError } = await supabase.functions.invoke('create-elevenlabs-agent', {
        body: { name }
      });

      if (elevenlabsError) throw new Error(elevenlabsError.message);

      // Create agent in our database
      await createAgent.mutateAsync({ 
        name, 
        elevenlabsAgentId: elevenlabsAgent.id 
      });

      toast({ title: "Agent created successfully" });
      setOpen(false);
      setName("");
    } catch (error) {
      toast({
        title: "Failed to create agent",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Agent"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

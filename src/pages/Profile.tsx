
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { Phone } from "lucide-react";
import { CreateAgentDialog } from "@/components/CreateAgentDialog";
import { useAgents } from "@/hooks/useAgents";

const Profile = () => {
  const { agents, isLoading } = useAgents();

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Voice Agents</h1>
          <CreateAgentDialog />
        </div>

        {isLoading ? (
          <div>Loading agents...</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents?.map((agent) => (
              <Card key={agent.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    {agent.name}
                  </CardTitle>
                  <CardDescription>ElevenLabs Agent ID: {agent.elevenlabs_agent_id}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" asChild>
                    <a href={`/agent/${agent.id}`}>View Agent</a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Profile;

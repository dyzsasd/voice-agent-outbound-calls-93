
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { Phone, Globe, Code, MessageSquare, Calendar } from "lucide-react";
import { CreateAgentDialog } from "@/components/CreateAgentDialog";
import { useAgents } from "@/hooks/useAgents";
import { formatDistance } from "date-fns";

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
          <div className="flex justify-center items-center min-h-[300px]">
            <p>Loading agents...</p>
          </div>
        ) : agents && agents.length === 0 ? (
          <div className="text-center p-12 border border-dashed rounded-lg">
            <Phone className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No agents yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first voice agent to get started.
            </p>
            <CreateAgentDialog />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents?.map((agent) => (
              <Card key={agent.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    {agent.name}
                  </CardTitle>
                  <CardDescription className="flex flex-col gap-1 mt-2">
                    <div className="flex items-center text-xs">
                      <Calendar className="h-3 w-3 mr-1" />
                      Created {formatDistance(new Date(agent.created_at), new Date(), { addSuffix: true })}
                    </div>
                    <div className="flex items-center text-xs">
                      <Globe className="h-3 w-3 mr-1" />
                      Language: {agent.language || 'English'}
                    </div>
                    <div className="flex items-center text-xs truncate">
                      <Code className="h-3 w-3 mr-1 flex-shrink-0" />
                      Model: {agent.llm_model || 'GPT-4o Mini'}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start gap-2 text-xs text-muted-foreground mb-3">
                      <MessageSquare className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">
                        Default greeting
                      </span>
                    </div>
                    <Button variant="outline" className="w-full" asChild>
                      <a href={`/agent/${agent.id}`}>View Agent</a>
                    </Button>
                  </div>
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

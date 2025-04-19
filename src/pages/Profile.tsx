
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { Phone, Calendar, Globe2, MessageSquare, Cpu, FileText } from "lucide-react";
import { CreateAgentDialog } from "@/components/CreateAgentDialog";
import { useAgents } from "@/hooks/useAgents";
import { formatDistance } from "date-fns";
import { useState } from "react";
import { useTasks } from "@/hooks/useTasks";

const Profile = () => {
  const { agents, isLoading, fetchAgentDetailsFromElevenLabs } = useAgents();
  const [agentDetails, setAgentDetails] = useState<{ [key: string]: any }>({});
  const [loadingDetails, setLoadingDetails] = useState<{ [key: string]: boolean }>({});
  
  const { tasks: allTasks } = useTasks();

  const loadAgentDetails = async (agentId: string, elevenlabsAgentId: string) => {
    if (agentDetails[agentId]) return;
    
    setLoadingDetails(prev => ({ ...prev, [agentId]: true }));
    try {
      const details = await fetchAgentDetailsFromElevenLabs(elevenlabsAgentId);
      setAgentDetails(prev => ({ ...prev, [agentId]: details }));
    } catch (error) {
      console.error("Failed to fetch agent details:", error);
    } finally {
      setLoadingDetails(prev => ({ ...prev, [agentId]: false }));
    }
  };

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
            {agents?.map((agent) => {
              const details = agentDetails[agent.id];
              const agentTasks = allTasks?.filter(task => task.agent_id === agent.id) || [];
              
              if (!details && !loadingDetails[agent.id]) {
                loadAgentDetails(agent.id, agent.elevenlabs_agent_id);
              }
              
              return (
                <Card key={agent.id} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      {agent.name}
                    </CardTitle>
                    <div className="flex items-center text-xs text-muted-foreground mt-2">
                      <Calendar className="h-3 w-3 mr-1" />
                      Updated {formatDistance(new Date(agent.updated_at), new Date(), { addSuffix: true })}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {loadingDetails[agent.id] ? (
                      <p className="text-sm text-muted-foreground">Loading details...</p>
                    ) : details ? (
                      <div className="space-y-2">
                        <div className="flex items-start gap-2 text-sm">
                          <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                          <p className="text-muted-foreground">
                            {details.conversation_config?.agent?.first_message || "No first message set"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Globe2 className="h-4 w-4 text-muted-foreground" />
                          <p className="text-muted-foreground">
                            Language: {details.conversation_config?.agent?.language || "Not set"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Cpu className="h-4 w-4 text-muted-foreground" />
                          <p className="text-muted-foreground">
                            Model: {details.conversation_config?.agent?.prompt?.llm || "Not set"}
                          </p>
                        </div>
                      </div>
                    ) : null}
                    {agentTasks.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Recent Tasks</h4>
                        <div className="space-y-2">
                          {agentTasks.slice(0, 3).map((task) => (
                            <div key={task.id} className="flex items-center gap-2 text-sm">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                {task.name || `Task for ${task.to_phone_number}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <Button variant="outline" className="w-full" asChild>
                      <a href={`/agent/${agent.id}`}>View Agent</a>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Profile;

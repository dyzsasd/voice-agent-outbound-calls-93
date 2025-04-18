
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { Phone } from "lucide-react";

const Profile = () => {
  const mockAgents = [
    { id: 1, name: "Sales Assistant", tasks: 12, status: "active" },
    { id: 2, name: "Support Agent", tasks: 8, status: "active" },
  ];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Voice Agents</h1>
          <Button>Create New Agent</Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockAgents.map((agent) => (
            <Card key={agent.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  {agent.name}
                </CardTitle>
                <CardDescription>{agent.tasks} tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" asChild>
                  <a href={`/agent/${agent.id}`}>View Agent</a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Profile;

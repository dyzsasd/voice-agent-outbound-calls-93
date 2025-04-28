
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { PhoneCall, Users, BarChart } from "lucide-react";

const Index = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you soon.");
  };

  const features = [
    {
      title: "Personalized Agents",
      description: "Create custom voice agents tailored to your business needs.",
      icon: Users,
    },
    {
      title: "Outbound Calls",
      description: "Manage and monitor outbound calls with detailed analytics.",
      icon: PhoneCall,
    },
    {
      title: "Call Tracking",
      description: "Track conversation transcripts and call outcomes.",
      icon: BarChart,
    },
  ];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <section className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-6 text-neutral-900">Intelligent Voice Agents for Your Business</h1>
          <p className="text-xl text-neutral mb-8 max-w-3xl mx-auto">Create personalized AI voice agents to handle your outbound calls efficiently and professionally.</p>
          
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {features.map((feature, index) => (
              <Card key={index} className="hover-scale card-shadow border border-muted overflow-hidden">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 mx-auto">
                    <feature.icon size={24} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-neutral">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <div className="text-center mb-12 animate-fade-in">
          <Button asChild size="lg" className="mx-auto px-8 py-6 text-base font-medium">
            <Link to="/auth">Get Started</Link>
          </Button>
        </div>

        <section className="max-w-xl mx-auto bg-white rounded-lg p-8 card-shadow border border-muted">
          <h2 className="text-2xl font-bold mb-6 text-center">Contact Us</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2 text-neutral-800">Name</label>
              <Input id="name" required className="border-muted" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2 text-neutral-800">Email</label>
              <Input id="email" type="email" required className="border-muted" />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-2 text-neutral-800">Message</label>
              <Textarea id="message" required className="min-h-[120px] border-muted" />
            </div>
            <Button type="submit" className="w-full">Send Message</Button>
          </form>
        </section>
      </div>
    </Layout>
  );
};

export default Index;

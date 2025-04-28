
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { Link } from "react-router-dom";

const Index = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you soon.");
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <section className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-6">Intelligent Voice Agents for Your Business</h1>
          <p className="text-xl text-gray-600 mb-8">Create personalized AI voice agents to handle your outbound calls efficiently and professionally.</p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 border rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Personalized Agents</h3>
              <p className="text-gray-600">Create custom voice agents tailored to your business needs.</p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Outbound Calls</h3>
              <p className="text-gray-600">Manage and monitor outbound calls with detailed analytics.</p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Call Tracking</h3>
              <p className="text-gray-600">Track conversation transcripts and call outcomes.</p>
            </div>
          </div>
        </section>

        <div className="text-center mb-8">
          <Button asChild className="mx-auto">
            <Link to="/auth">Get Started</Link>
          </Button>
        </div>

        <section className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Contact Us</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">Name</label>
              <Input id="name" required />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
              <Input id="email" type="email" required />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-2">Message</label>
              <Textarea id="message" required className="min-h-[120px]" />
            </div>
            <Button type="submit" className="w-full">Send Message</Button>
          </form>
        </section>
      </div>
    </Layout>
  );
};

export default Index;

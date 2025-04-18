
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAgents } from "@/hooks/useAgents";
import { PlusCircle, Mic, Globe, Code, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useForm, Controller } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";

// Supported languages with their display names
const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'pl', name: 'Polish' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ar', name: 'Arabic' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'nl', name: 'Dutch' },
  { code: 'ru', name: 'Russian' },
  { code: 'tr', name: 'Turkish' }
];

// Supported LLM models
const LLM_MODELS = [
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
  { id: 'gpt-4o', name: 'GPT-4o' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
  { id: 'claude-3-7-sonnet', name: 'Claude 3.7 Sonnet' },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet' },
  { id: 'claude-3-haiku', name: 'Claude 3 Haiku' }
];

interface AgentFormValues {
  name: string;
  firstMessage: string;
  language: string;
  prompt: string;
  llmModel: string;
}

export function CreateAgentDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { createAgent } = useAgents();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AgentFormValues>({
    defaultValues: {
      name: "",
      firstMessage: "",
      language: "en",
      prompt: "",
      llmModel: "gpt-4o-mini"
    }
  });

  const handleSubmit = async (values: AgentFormValues) => {
    setIsLoading(true);
    
    try {
      // Create ElevenLabs agent
      const { data: elevenlabsAgent, error: elevenlabsError } = await supabase.functions.invoke('create-elevenlabs-agent', {
        body: { 
          name: values.name,
          firstMessage: values.firstMessage || `Hi, I'm ${values.name}. How can I help you today?`,
          language: values.language,
          prompt: values.prompt,
          llmModel: values.llmModel
        }
      });

      if (elevenlabsError) throw new Error(elevenlabsError.message);

      // Create agent in our database
      await createAgent.mutateAsync({ 
        name: values.name, 
        elevenlabsAgentId: elevenlabsAgent.agent_id,
        language: values.language,
        llmModel: values.llmModel
      });

      toast({ title: "Agent created successfully" });
      setOpen(false);
      form.reset();
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Voice Agent</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agent Name</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <Mic className="mr-2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Enter agent name" 
                        {...field} 
                        required
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    The name of your voice agent.
                  </FormDescription>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="firstMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Message</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <MessageSquare className="mr-2 h-4 w-4 text-muted-foreground self-start mt-2" />
                      <Textarea 
                        placeholder="Hi, I'm your assistant. How can I help you today?" 
                        className="min-h-20"
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    The first message the agent will say to the user. Leave empty for default greeting.
                  </FormDescription>
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <div className="flex items-center">
                      <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {LANGUAGES.map((language) => (
                            <SelectItem key={language.code} value={language.code}>
                              {language.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <FormDescription>
                      The language for ASR and TTS.
                    </FormDescription>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="llmModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LLM Model</FormLabel>
                    <div className="flex items-center">
                      <Code className="mr-2 h-4 w-4 text-muted-foreground" />
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select model" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {LLM_MODELS.map((model) => (
                            <SelectItem key={model.id} value={model.id}>
                              {model.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <FormDescription>
                      The language model for the agent.
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>System Prompt</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <Code className="mr-2 h-4 w-4 text-muted-foreground self-start mt-2" />
                      <Textarea 
                        placeholder="You are a helpful AI assistant..." 
                        className="min-h-28"
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    The system prompt that defines the agent's behavior. Leave empty for default.
                  </FormDescription>
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Agent"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

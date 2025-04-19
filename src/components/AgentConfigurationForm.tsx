
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface AgentConfigurationFormProps {
  agentDetails: any;
  isUpdating: boolean;
  onUpdate: (updates: any) => void;
}

export function AgentConfigurationForm({ agentDetails, isUpdating, onUpdate }: AgentConfigurationFormProps) {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState(agentDetails?.conversation_config?.agent?.prompt?.prompt || "");
  const [firstMessage, setFirstMessage] = useState(agentDetails?.conversation_config?.agent?.first_message || "");
  const [language, setLanguage] = useState(agentDetails?.conversation_config?.agent?.language || "en");
  const [llmModel, setLlmModel] = useState(agentDetails?.conversation_config?.agent?.prompt?.llm || "gpt-4o-mini");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build the updates object
    const updates = {
      conversation_config: {
        agent: {
          prompt: {
            prompt: prompt,
            llm: llmModel
          },
          first_message: firstMessage,
          language: language
        }
      }
    };

    // Validate model for non-English languages
    if (language !== "en") {
      // For non-English languages, ElevenLabs requires either eleven_turbo_v2 or eleven_turbo_v2_5
      if (!nonEnglishCompatibleModels.includes(llmModel)) {
        toast({
          title: "Validation Error",
          description: "Non-English agents must use eleven_turbo_v2 or eleven_turbo_v2_5 models",
          variant: "destructive"
        });
        return;
      }
    }
    
    onUpdate(updates);
  };

  // Update LLM model when language changes
  useEffect(() => {
    if (language !== "en" && !nonEnglishCompatibleModels.includes(llmModel)) {
      setLlmModel("eleven_turbo_v2"); // Default to a compatible model for non-English
    }
  }, [language, llmModel]);

  // Multi-language models according to ElevenLabs API restrictions
  const nonEnglishCompatibleModels = [
    "eleven_turbo_v2",
    "eleven_turbo_v2_5"
  ];

  // All available models
  const availableModels = [
    "gpt-4o-mini",
    "gpt-4o",
    "gpt-4",
    "gpt-4-turbo",
    "gpt-3.5-turbo",
    "gemini-1.5-pro",
    "gemini-1.5-flash",
    "gemini-2.0-flash-001",
    "gemini-2.0-flash-lite",
    "gemini-1.0-pro",
    "claude-3-7-sonnet",
    "claude-3-5-sonnet",
    "claude-3-5-sonnet-v1",
    "claude-3-haiku",
    "grok-beta",
    "custom-llm",
    "eleven_turbo_v2",
    "eleven_turbo_v2_5"
  ];

  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "it", name: "Italian" },
    { code: "pt", name: "Portuguese" },
    { code: "nl", name: "Dutch" },
    { code: "pl", name: "Polish" },
    { code: "ja", name: "Japanese" },
    { code: "ko", name: "Korean" },
    { code: "zh", name: "Chinese" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>System Prompt</Label>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter system prompt..."
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label>First Message</Label>
        <Input
          value={firstMessage}
          onChange={(e) => setFirstMessage(e.target.value)}
          placeholder="Enter the first message the agent will say..."
        />
      </div>

      <div className="space-y-2">
        <Label>Language</Label>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger>
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {language !== "en" && (
          <p className="text-xs text-amber-600 mt-1">
            Non-English agents require eleven_turbo_v2 or eleven_turbo_v2_5 model
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>LLM Model</Label>
        <Select 
          value={llmModel} 
          onValueChange={setLlmModel}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select LLM model" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {availableModels.map((model) => (
                <SelectItem 
                  key={model} 
                  value={model}
                  disabled={language !== "en" && !nonEnglishCompatibleModels.includes(model)}
                >
                  {model} {language !== "en" && !nonEnglishCompatibleModels.includes(model) ? "(English only)" : ""}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={isUpdating}>
        {isUpdating ? "Updating..." : "Update Configuration"}
      </Button>
    </form>
  );
}

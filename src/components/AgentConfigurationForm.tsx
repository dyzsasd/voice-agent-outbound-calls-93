
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LanguageSelector } from "./agent/LanguageSelector";
import { ModelSelector } from "./agent/ModelSelector";
import { AgentMessages } from "./agent/AgentMessages";

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
    const nonEnglishCompatibleModels = ["eleven_turbo_v2", "eleven_turbo_v2_5"];
    if (language !== "en") {
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
    const nonEnglishCompatibleModels = ["eleven_turbo_v2", "eleven_turbo_v2_5"];
    if (language !== "en" && !nonEnglishCompatibleModels.includes(llmModel)) {
      setLlmModel("eleven_turbo_v2"); // Default to a compatible model for non-English
    }
  }, [language, llmModel]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <AgentMessages
        prompt={prompt}
        onPromptChange={setPrompt}
        firstMessage={firstMessage}
        onFirstMessageChange={setFirstMessage}
      />

      <LanguageSelector
        value={language}
        onChange={setLanguage}
      />

      <ModelSelector
        value={llmModel}
        onChange={setLlmModel}
        selectedLanguage={language}
      />

      <Button type="submit" disabled={isUpdating}>
        {isUpdating ? "Updating..." : "Update Configuration"}
      </Button>
    </form>
  );
}

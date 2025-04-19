
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AgentMessagesProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  firstMessage: string;
  onFirstMessageChange: (value: string) => void;
}

export const AgentMessages = ({
  prompt,
  onPromptChange,
  firstMessage,
  onFirstMessageChange,
}: AgentMessagesProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label>System Prompt</Label>
        <Textarea
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="Enter system prompt..."
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label>First Message</Label>
        <Input
          value={firstMessage}
          onChange={(e) => onFirstMessageChange(e.target.value)}
          placeholder="Enter the first message the agent will say..."
        />
      </div>
    </>
  );
};


import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
  selectedLanguage: string;
}

export const ModelSelector = ({ value, onChange, selectedLanguage }: ModelSelectorProps) => {
  const nonEnglishCompatibleModels = [
    "eleven_turbo_v2",
    "eleven_turbo_v2_5"
  ];

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

  return (
    <div className="space-y-2">
      <Label>LLM Model</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select LLM model" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {availableModels.map((model) => (
              <SelectItem 
                key={model} 
                value={model}
                disabled={selectedLanguage !== "en" && !nonEnglishCompatibleModels.includes(model)}
              >
                {model} {selectedLanguage !== "en" && !nonEnglishCompatibleModels.includes(model) ? "(English only)" : ""}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

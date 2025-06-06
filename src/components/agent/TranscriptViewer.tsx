
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

interface TranscriptViewerProps {
  taskId: string;
  taskName: string;
  phoneNumber: string;
}

export const TranscriptViewer = ({ taskId, taskName, phoneNumber }: TranscriptViewerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const { data: conversation, isLoading } = useQuery({
    queryKey: ["conversation", taskId, isOpen],
    queryFn: async () => {
      console.log("Fetching conversation for task:", taskId);
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("task_id", taskId)
        .single();

      if (error) {
        console.error("Error fetching conversation:", error);
        throw error;
      }

      console.log("Fetched conversation:", data);
      return data;
    },
    enabled: isOpen, // Only fetch when dialog is open
  });

  const downloadTranscript = () => {
    if (!conversation?.transcript || !Array.isArray(conversation.transcript)) {
      console.error("Invalid transcript structure:", conversation?.transcript);
      return;
    }
    
    const messages = conversation.transcript;
    const text = messages
      .map((msg: any) => `${msg.role}: ${msg.message}`)
      .join('\n\n');
      
    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${taskName || phoneNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileText className="h-4 w-4 mr-2" />
          View Transcript
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{taskName || `Conversation with ${phoneNumber}`}</DialogTitle>
          <DialogDescription>
            Conversation transcript with AI agent
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <Button variant="outline" onClick={downloadTranscript} className="mb-4">
            <Download className="h-4 w-4 mr-2" />
            Download Transcript
          </Button>
          <div className="max-h-[60vh] overflow-y-auto space-y-4 border rounded-lg p-4">
            {isLoading ? (
              <div className="text-center text-muted-foreground">Loading transcript...</div>
            ) : conversation?.transcript && Array.isArray(conversation.transcript) ? (
              conversation.transcript.map((message: any, index: number) => (
                <div key={index} className="space-y-1">
                  <div className="font-semibold capitalize">{message.role}:</div>
                  <div className="text-muted-foreground whitespace-pre-wrap break-words">{message.message}</div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground">No transcript data available</div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

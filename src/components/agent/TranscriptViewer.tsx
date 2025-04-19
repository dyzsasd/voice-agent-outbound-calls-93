
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TranscriptViewerProps {
  transcript: any;
  taskName: string;
  phoneNumber: string;
}

export const TranscriptViewer = ({ transcript, taskName, phoneNumber }: TranscriptViewerProps) => {
  const downloadTranscript = () => {
    const messages = transcript.messages || [];
    const text = messages
      .map((msg: any) => `${msg.role}: ${msg.content}`)
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
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileText className="h-4 w-4 mr-2" />
          View Transcript
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{taskName || `Conversation with ${phoneNumber}`}</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <Button variant="outline" onClick={downloadTranscript} className="mb-4">
            <Download className="h-4 w-4 mr-2" />
            Download Transcript
          </Button>
          <div className="max-h-[60vh] overflow-y-auto space-y-4 border rounded-lg p-4">
            {transcript?.messages?.map((message: any, index: number) => (
              <div key={index} className="space-y-1">
                <div className="font-semibold capitalize">{message.role}:</div>
                <div className="text-muted-foreground">{message.content}</div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

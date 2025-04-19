
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface CreateTaskFormProps {
  onSubmit: (taskName: string, phoneNumber: string) => Promise<void>;
  isCreating: boolean;
}

export const CreateTaskForm = ({ onSubmit, isCreating }: CreateTaskFormProps) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [taskName, setTaskName] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate phone number format (basic validation)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number with country code (e.g., +1234567890)",
        variant: "destructive",
      });
      return;
    }

    await onSubmit(taskName, phoneNumber);
    setPhoneNumber("");
    setTaskName("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Task</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="taskName">Task Name (Optional)</Label>
            <Input
              id="taskName"
              type="text"
              placeholder="Enter task name (optional)"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="Enter phone number with country code (e.g., +1234567890)"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              className="mt-2"
            />
          </div>
          <Button type="submit" disabled={isCreating} className="w-full">
            Create Task
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PhoneCall } from "lucide-react";
import { Task } from "@/types/task";
import { TranscriptViewer } from "./TranscriptViewer";

interface TaskListProps {
  tasks: Task[];
  onRunTask: (taskId: string, phoneNumber: string) => Promise<void>;
  runningTasks: Record<string, boolean>;
  isRunningTask: boolean;
}

export const TaskList = ({ tasks, onRunTask, runningTasks, isRunningTask }: TaskListProps) => {
  return (
    <div className="grid gap-4">
      <h2 className="text-2xl font-bold">Tasks</h2>
      {tasks?.map((task) => (
        <Card key={task.id}>
          <CardHeader>
            <CardTitle>
              {task.name || `Task for ${task.to_phone_number}`}
              <p className="text-sm text-muted-foreground mt-1">
                {task.to_phone_number}
              </p>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div>
                  Status:{" "}
                  <span
                    className={
                      task.status === "idle"
                        ? "text-amber-500"
                        : task.status === "processing"
                        ? "text-blue-500"
                        : task.status === "finished"
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                  </span>
                </div>
                <div>Created: {new Date(task.created_at).toLocaleString()}</div>
              </div>
              <div className="flex gap-2">
                {task.status === "idle" && (
                  <Button
                    variant="default"
                    onClick={() => onRunTask(task.id, task.to_phone_number)}
                    disabled={runningTasks[task.id] || isRunningTask}
                  >
                    <PhoneCall className="h-4 w-4 mr-2" />
                    {runningTasks[task.id] ? "Initiating Call..." : "Run Task"}
                  </Button>
                )}
                {task.status === "finished" && (
                  <TranscriptViewer
                    taskId={task.id}
                    taskName={task.name}
                    phoneNumber={task.to_phone_number}
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};


export interface Task {
  id: string;
  name: string | null;
  to_phone_number: string;
  status: 'idle' | 'processing' | 'finished' | 'failed' | 'unknown';
  created_at: string;
  agent_id: string;
  call_id: string | null;
  conversation_id: string | null;
}


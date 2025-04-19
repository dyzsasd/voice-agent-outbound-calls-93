
export interface ConversationResponse {
  conversations: Array<{
    conversation_id: string;
  }>;
}

export interface ConversationDetail {
  status: string;
  transcript: any;
  metadata: {
    phone_call?: {
      call_sid?: string;
    };
  };
  analysis: any;
}

export interface RequestData {
  agent_id: string;
}

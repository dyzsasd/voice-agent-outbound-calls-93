
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";
import type { ConversationDetail } from "./types.ts";

export class Database {
  private supabase;

  constructor(url: string, serviceKey: string) {
    this.supabase = createClient(url, serviceKey);
  }

  async getAgent(agentId: string) {
    const { data, error } = await this.supabase
      .from('agents')
      .select('elevenlabs_agent_id')
      .eq('id', agentId)
      .single();

    if (error) throw error;
    return data;
  }

  async getExistingConversations(agentId: string) {
    const { data, error } = await this.supabase
      .from('conversations')
      .select('conversation_id')
      .eq('agent_id', agentId);

    if (error) throw error;
    return data || [];
  }

  async findTaskByCallId(callId: string | null) {
    if (!callId) return null;
    
    const { data, error } = await this.supabase
      .from('tasks')
      .select('id')
      .eq('call_id', callId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async insertConversation(
    conversationId: string,
    callId: string | null,
    agentId: string,
    taskId: string | null,
    detail: ConversationDetail
  ) {
    const { error } = await this.supabase
      .from('conversations')
      .insert({
        conversation_id: conversationId,
        call_id: callId,
        agent_id: agentId,
        task_id: taskId,
        status: detail.status,
        transcript: detail.transcript,
        metadata: detail.metadata,
        analysis: detail.analysis
      });

    if (error) throw error;
  }

  async updateTaskStatus(
    taskId: string,
    conversationId: string,
    status: string
  ) {
    const taskStatus = status === 'done' ? 'finished' : 
                      status === 'failed' ? 'failed' : 'unknown';

    const { error } = await this.supabase
      .from('tasks')
      .update({ 
        conversation_id: conversationId,
        status: taskStatus 
      })
      .eq('id', taskId);

    if (error) throw error;
    return taskStatus;
  }
}

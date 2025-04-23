
import { Database } from "./database.ts";
import { ElevenLabsAPI } from "./elevenlabs-api.ts";
import type { ConversationDetail, ConversationResponse } from "./types.ts";

export class ConversationService {
  constructor(
    private db: Database,
    private elevenlabs: ElevenLabsAPI
  ) {}

  async syncConversations(agentId: string, elevenlabsAgentId: string): Promise<string[]> {
    // Fetch existing conversations from database
    const existingConversations = await this.db.getExistingConversations(agentId);
    console.log(`Found ${existingConversations.length} existing conversations in database`);
    const existingIds = new Set(existingConversations.map(c => c.conversation_id));

    // Fetch conversations from ElevenLabs
    console.log(`Fetching conversations from ElevenLabs API for elevenlabs_agent_id: ${elevenlabsAgentId}`);
    const response = await this.elevenlabs.fetchConversations(elevenlabsAgentId);
    console.log(`ElevenLabs API response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error details: ${errorText}`);
      throw new Error(`Failed to fetch conversations: ${response.statusText}. Details: ${errorText}`);
    }

    const data = await response.json() as ConversationResponse;
    console.log(`Received ${data.conversations?.length || 0} conversations from ElevenLabs API`);
    
    if (!data.conversations || !Array.isArray(data.conversations)) {
      console.error('Unexpected API response format:', JSON.stringify(data));
      throw new Error('Invalid API response format');
    }

    const newConversations: string[] = [];

    // Process each conversation
    for (const conv of data.conversations) {
      console.log(`Processing conversation: ${conv.conversation_id}`);
      
      if (!existingIds.has(conv.conversation_id)) {
        await this.processConversation(conv.conversation_id, agentId, newConversations);
      } else {
        console.log(`Conversation ${conv.conversation_id} already exists in database, skipping`);
      }
    }

    return newConversations;
  }

  private async processConversation(conversationId: string, agentId: string, newConversations: string[]): Promise<void> {
    try {
      // Fetch detailed conversation data
      console.log(`Fetching details for conversation: ${conversationId}`);
      const detailResponse = await this.elevenlabs.fetchConversationDetails(conversationId);

      if (!detailResponse.ok) {
        const detailErrorText = await detailResponse.text();
        console.error(`Error fetching conversation details: ${detailErrorText}`);
        return;
      }

      const detail = await detailResponse.json() as ConversationDetail;
      console.log(`Received details for conversation: ${conversationId}, status: ${detail.status}`);
      
      // Only proceed if the conversation status is 'done' or 'failed'
      const status = detail.status.toLowerCase();
      if (status !== 'done' && status !== 'failed') {
        console.log(`Skipping conversation ${conversationId} with status: ${status}`);
        return;
      }

      const callId = detail.metadata?.phone_call?.call_sid || null;
      console.log(`Call ID from metadata: ${callId || 'none'}`);

      // Find associated task
      const task = await this.db.findTaskByCallId(callId);
      console.log(`Associated task ID: ${task?.id || 'none'}`);

      // Insert conversation
      await this.db.insertConversation(
        conversationId,
        callId,
        agentId,
        task?.id || null,
        detail
      );
      
      console.log(`Successfully inserted conversation: ${conversationId}`);

      // Update task if found
      if (task?.id) {
        const taskStatus = await this.db.updateTaskStatus(task.id, conversationId, status);
        console.log(`Successfully updated task ${task.id} with conversation_id ${conversationId} and status ${taskStatus}`);
      }

      newConversations.push(conversationId);
    } catch (error) {
      console.error(`Error processing conversation ${conversationId}:`, error);
    }
  }
}

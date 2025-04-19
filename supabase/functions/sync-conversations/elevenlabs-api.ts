
export class ElevenLabsAPI {
  constructor(private apiKey: string) {}

  async fetchConversations(elevenlabsAgentId: string): Promise<Response> {
    return fetch(`https://api.elevenlabs.io/v1/convai/conversations?agent_id=${elevenlabsAgentId}`, {
      headers: {
        'xi-api-key': this.apiKey,
      },
    });
  }

  async fetchConversationDetails(conversationId: string): Promise<Response> {
    return fetch(
      `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`,
      {
        headers: {
          'xi-api-key': this.apiKey,
        },
      }
    );
  }
}

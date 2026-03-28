/**
 * Conversation API service for managing AI chat history
 */

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const API_BASE = `${apiUrl}/api/conversations`;

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  is_pinned: boolean;
  metadata: any;
  message_count?: number;
  last_message?: string;
  last_message_time?: string;
  messages?: Message[];
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: any;
}

export class ConversationApi {
  /**
   * Create a new conversation
   */
  static async createConversation(title?: string): Promise<Conversation> {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create conversation');
    }
    
    return response.json();
  }

  /**
   * Get all conversations
   */
  static async getConversations(limit = 50, offset = 0): Promise<{ conversations: Conversation[], count: number }> {
    const response = await fetch(`${API_BASE}?limit=${limit}&offset=${offset}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch conversations');
    }
    
    return response.json();
  }

  /**
   * Get a single conversation with all messages
   */
  static async getConversation(id: string): Promise<Conversation> {
    const response = await fetch(`${API_BASE}/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch conversation');
    }
    
    return response.json();
  }

  /**
   * Update a conversation (title, pin status, etc.)
   */
  static async updateConversation(
    id: string,
    updates: { title?: string; is_pinned?: boolean; metadata?: any }
  ): Promise<Conversation> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update conversation');
    }
    
    return response.json();
  }

  /**
   * Delete a conversation
   */
  static async deleteConversation(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete conversation');
    }
  }

  /**
   * Add a message to a conversation
   */
  static async addMessage(
    conversationId: string,
    role: 'user' | 'assistant',
    content: string,
    metadata?: any
  ): Promise<{ message: Message; title_updated: boolean; conversation?: Conversation }> {
    const response = await fetch(`${API_BASE}/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role, content, metadata }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add message');
    }
    
    return response.json();
  }

  /**
   * Search conversations by title or content
   */
  static async searchConversations(query: string, limit = 20): Promise<{ results: Conversation[], count: number }> {
    const response = await fetch(`${API_BASE}/search/query?q=${encodeURIComponent(query)}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error('Failed to search conversations');
    }
    
    return response.json();
  }

  /**
   * Generate conversation title after AI response completion (deferred)
   */
  static async generateTitleDeferred(conversationId: string): Promise<{ success: boolean; conversation: Conversation; conversation_id: string }> {
    const response = await fetch(`${API_BASE}/${conversationId}/generate-title-deferred`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate conversation title');
    }
    
    return response.json();
  }

  /**
   * Clean up old unpinned conversations
   */
  static async cleanupOldConversations(days = 30): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE}/cleanup?days=${days}`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error('Failed to cleanup conversations');
    }
    
    return response.json();
  }
}
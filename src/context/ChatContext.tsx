import { createContext, useContext, useState, ReactNode } from 'react';

// n8n webhook URL
const N8N_CHAT_URL = 'https://axmed.app.n8n.cloud/webhook/chat';

// Chat message type
export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

// Context type
interface ChatContextType {
  messages: ChatMessage[];
  isOpen: boolean;
  isLoading: boolean;
  openChat: () => void;
  closeChat: () => void;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
}

// Create context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Get or create session ID (persists in localStorage)
const getSessionId = (): string => {
  let sessionId = localStorage.getItem('axmedChatSessionId');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('axmedChatSessionId', sessionId);
  }
  return sessionId;
};

// Initial welcome message
const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  content: "Hi there! I'm Axmed AI. How can I help you today?",
  sender: 'ai',
  timestamp: new Date(),
};

// Provider component
export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const openChat = () => setIsOpen(true);
  const closeChat = () => setIsOpen(false);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content: content.trim(),
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Send to n8n webhook
      const requestBody = {
        action: 'sendMessage',
        sessionId: getSessionId(),
        chatInput: content.trim(),
      };
      console.log('Sending to n8n:', requestBody);

      const response = await fetch(N8N_CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const responseText = await response.text();
      console.log('n8n response status:', response.status);
      console.log('n8n response body:', responseText);

      if (!response.ok) {
        throw new Error(`n8n error: ${response.status} - ${responseText}`);
      }

      const data = JSON.parse(responseText);

      // Add AI response
      const aiMessage: ChatMessage = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content: data.output || data.text || data.message || 'Sorry, I could not process that request.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      // Add error message
      const errorMessage: ChatMessage = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content: `Sorry, something went wrong. ${error instanceof Error ? error.message : 'Please try again.'}`,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([WELCOME_MESSAGE]);
    // Generate new session ID when clearing
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('axmedChatSessionId', newSessionId);
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        isOpen,
        isLoading,
        openChat,
        closeChat,
        sendMessage,
        clearMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

// Hook to use the context
export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}

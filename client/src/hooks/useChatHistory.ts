import { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';

interface Source {
  page: number;
  source: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  timestamp: number;
}

const STORAGE_KEY = "research-assistant-chat-history";

export function useChatHistory() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load messages from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setMessages(parsed);
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error("Failed to save chat history:", error);
    }
  }, [messages]);

  const addMessage = (message: Omit<Message, "id" | "timestamp">) => {
    const newMessage: Message = {
      ...message,
      id: uuidv4(),
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  };

  const sendQuery = async (query: string) => {
    addMessage({ role: "user", content: query });
    setIsLoading(true);

    try {
      const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      
      addMessage({
        role: "assistant",
        content: data.answer,
        sources: data.sources,
      });
    } catch (error) {
      addMessage({
        role: "assistant",
        content: "Sorry, I encountered an error while processing your request. Please make sure the backend server is running.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    messages,
    isLoading,
    sendQuery,
    clearHistory,
  };
}

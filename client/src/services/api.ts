import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://echoes-b18n.onrender.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Memory {
  content: string;
  timestamp: string;
}

export interface Conversation {
  message: string;
  isUser: boolean;
  timestamp: string;
}

export interface Sentiment {
  emotion: string;
  intensity: number;
  needsSupport: boolean;
  supportType?: string;
}

export interface AIResponse {
  response: string;
  sentiment: Sentiment;
  conversation: {
    userMessage: string;
    aiResponse: string;
    timestamp: string;
  };
}

export interface Session {
  _id: string;
  userId: string;
  personName: string;
  relationshipType?: 'family' | 'friend' | 'partner' | 'pet' | 'mentor' | 'other';
  memories: Memory[];
  conversations: Conversation[];
  finalLetter?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

// Auth API
export const authAPI = {
  register: async (email: string, password: string, name: string): Promise<AuthResponse> => {
    const response = await api.post('/register', { email, password, name });
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/login', { email, password });
    return response.data;
  },

  getUser: async (): Promise<User> => {
    const response = await api.get('/user');
    return response.data.user || response.data;
  },
};

// Session API
export const sessionAPI = {
  createSession: async (
    personName: string, 
    relationshipType?: 'family' | 'friend' | 'partner' | 'pet' | 'mentor' | 'other'
  ): Promise<Session> => {
    const response = await api.post('/sessions', { personName, relationshipType });
    return response.data.session || response.data;
  },

  getSessions: async (): Promise<Session[]> => {
    const response = await api.get('/sessions');
    return response.data.sessions || response.data;
  },

  getSession: async (id: string): Promise<Session> => {
    const response = await api.get(`/sessions/${id}`);
    return response.data.session || response.data;
  },

  updateSession: async (
    id: string, 
    data: { memories?: Memory[]; conversations?: Conversation[]; finalLetter?: string }
  ): Promise<Session> => {
    const response = await api.put(`/sessions/${id}`, data);
    return response.data.session || response.data;
  },

  deleteSession: async (id: string): Promise<void> => {
    await api.delete(`/sessions/${id}`);
  },
};

// AI API
export const aiAPI = {
  generateResponse: async (
    sessionId: string, 
    message: string, 
    relationshipType?: string
  ): Promise<AIResponse> => {
    const response = await api.post('/ai/chat', { 
      sessionId, 
      message, 
      relationshipType 
    });
    return response.data.data;
  },

  getGuidedPrompts: async (
    relationshipType?: string, 
    sessionStage?: 'beginning' | 'middle' | 'closure'
  ): Promise<{ prompts: string[]; stage: string }> => {
    const response = await api.get('/ai/prompts', {
      params: { relationshipType, sessionStage }
    });
    return response.data.data;
  },

  generateFinalLetter: async (
    sessionId: string, 
    relationshipType?: string
  ): Promise<{ finalLetter: string; session: Session }> => {
    const response = await api.post('/ai/final-letter', { 
      sessionId, 
      relationshipType 
    });
    return response.data.data;
  },

  analyzeSentiment: async (message: string): Promise<{ sentiment: Sentiment; message: string }> => {
    const response = await api.post('/ai/sentiment', { message });
    return response.data.data;
  },
};

export default api;

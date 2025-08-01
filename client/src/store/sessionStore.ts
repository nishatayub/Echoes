import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface SessionData {
  memories: Array<{
    content: string;
    timestamp: string;
  }>;
  conversations: Array<{
    message: string;
    isUser: boolean;
    timestamp: string;
  }>;
  finalLetter: string;
  currentStep: 'memory' | 'chat' | 'letter';
}

interface SessionStore {
  sessions: Record<string, SessionData>;
  
  // Session actions
  getSession: (sessionId: string) => SessionData;
  updateSession: (sessionId: string, data: Partial<SessionData>) => void;
  setCurrentStep: (sessionId: string, step: 'memory' | 'chat' | 'letter') => void;
  
  // Memory actions
  addMemory: (sessionId: string, content: string) => void;
  
  // Conversation actions
  addMessage: (sessionId: string, message: string, isUser: boolean) => void;
  
  // Letter actions
  updateLetter: (sessionId: string, letter: string) => void;
  
  // Clear session data
  clearSession: (sessionId: string) => void;
}

const defaultSessionData: SessionData = {
  memories: [],
  conversations: [],
  finalLetter: '',
  currentStep: 'memory'
};

export const useSessionStore = create<SessionStore>()(
  devtools(
    persist(
      (set, get) => ({
        sessions: {},

        getSession: (sessionId: string) => {
          const state = get();
          return state.sessions[sessionId] || defaultSessionData;
        },

        updateSession: (sessionId: string, data: Partial<SessionData>) => {
          set((state) => ({
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...state.sessions[sessionId] || defaultSessionData,
                ...data
              }
            }
          }));
        },

        setCurrentStep: (sessionId: string, step: 'memory' | 'chat' | 'letter') => {
          set((state) => ({
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...state.sessions[sessionId] || defaultSessionData,
                currentStep: step
              }
            }
          }));
        },

        addMemory: (sessionId: string, content: string) => {
          const timestamp = new Date().toISOString();
          set((state) => {
            const session = state.sessions[sessionId] || defaultSessionData;
            return {
              sessions: {
                ...state.sessions,
                [sessionId]: {
                  ...session,
                  memories: [...session.memories, { content, timestamp }]
                }
              }
            };
          });
        },

        addMessage: (sessionId: string, message: string, isUser: boolean) => {
          const timestamp = new Date().toISOString();
          set((state) => {
            const session = state.sessions[sessionId] || defaultSessionData;
            return {
              sessions: {
                ...state.sessions,
                [sessionId]: {
                  ...session,
                  conversations: [...session.conversations, { message, isUser, timestamp }]
                }
              }
            };
          });
        },

        updateLetter: (sessionId: string, letter: string) => {
          set((state) => ({
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...state.sessions[sessionId] || defaultSessionData,
                finalLetter: letter
              }
            }
          }));
        },

        clearSession: (sessionId: string) => {
          set((state) => {
            const remaining = { ...state.sessions };
            delete remaining[sessionId];
            return { sessions: remaining };
          });
        }
      }),
      {
        name: 'echoes-session-storage',
        partialize: (state) => ({ sessions: state.sessions })
      }
    )
  )
);

import { HiveTaskMessage } from '../types';

const STORAGE_KEY = 'hive_mind_chat_history_v1';
const MAX_SAVED_MESSAGES = 100;

/**
 * Loads persisted chat history from localStorage.
 * Restores all completed and previous messages across page reloads.
 */
export function loadChatHistory(): HiveTaskMessage[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.map((m: any) => {
      // If a task was pending when the page reloaded, ensure it doesn't stay stuck in spinning state
      if (m.status === 'processing') {
        return {
          ...m,
          status: m.result ? 'completed' : 'error',
          errorMessage: m.result ? undefined : 'Session was reloaded during task processing.',
        };
      }
      return m;
    });
  } catch (err) {
    console.warn('Failed to read chat history from localStorage:', err);
    return [];
  }
}

/**
 * Persists the chat history to localStorage.
 */
export function saveChatHistory(messages: HiveTaskMessage[]): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    // Keep most recent messages to protect localStorage quotas
    const toSave = messages.slice(-MAX_SAVED_MESSAGES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (err) {
    console.warn('Failed to persist chat history to localStorage:', err);
    // In case of quota errors, try keeping last 20 messages
    try {
      const trimmed = messages.slice(-20);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
      // Graceful fallback
    }
  }
}

/**
 * Clears the saved chat history from localStorage.
 */
export function clearSavedChatHistory(): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to remove chat history from localStorage:', err);
  }
}

const TASK_STORAGE_KEY = 'agent_dispatched_tasks_v1';

export function loadTaskHistory(): any[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = localStorage.getItem(TASK_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveTaskHistory(tasks: any[]): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(tasks.slice(-50)));
  } catch {
    // Graceful fallback
  }
}

export function clearSavedTaskHistory(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.removeItem(TASK_STORAGE_KEY);
  } catch {
    // Graceful fallback
  }
}


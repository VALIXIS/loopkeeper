import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  Meeting,
  ActionItem,
  DashboardOverview,
  ActionItemUpdate,
  MeetingCreate,
  TranscriptCreate
} from '../types';
import { api } from '../services/api';

export type NavigationTab =
  | 'dashboard'
  | 'meetings'
  | 'meeting-detail'
  | 'tasks'
  | 'task-detail'
  | 'workload'
  | 'radar'
  | 'insights'
  | 'graph'
  | 'settings';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

interface AppContextType {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  selectedMeetingId: string | null;
  setSelectedMeetingId: (id: string | null) => void;
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  navigateToMeeting: (id: string) => void;
  navigateToTask: (id: string) => void;

  theme: 'dark' | 'light';
  toggleTheme: () => void;

  meetings: Meeting[];
  actionItems: ActionItem[];
  dashboardOverview: DashboardOverview | null;
  loading: boolean;
  error: string | null;

  backendStatus: {
    isLive: boolean;
    service: string;
    ai_pipeline: string;
  };
  forceMockMode: boolean;
  setForceMockMode: (enabled: boolean) => void;

  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;

  refreshData: () => Promise<void>;
  createMeetingAndProcess: (
    meetingData: MeetingCreate,
    transcriptData: TranscriptCreate,
    onStepUpdate?: (stepIndex: number, stepName: string) => void
  ) => Promise<{ meeting: Meeting; actionItems: ActionItem[] }>;
  deleteMeeting: (id: string) => Promise<void>;
  updateTask: (id: string, updates: ActionItemUpdate) => Promise<ActionItem>;
  createTask: (data: { title: string; owner_name?: string; deadline?: string; description?: string }) => Promise<ActionItem>;
  resetDemoData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTabState] = useState<NavigationTab>('dashboard');
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const setActiveTab = useCallback((tab: NavigationTab) => {
    setActiveTabState(tab);
    let targetUrl = '/dashboard';
    if ((tab as string) === 'tasks' || (tab as string) === 'commitments') targetUrl = '/commitments';
    else if (tab === 'workload') targetUrl = '/workload';
    else if (tab === 'meetings') targetUrl = '/meetings';
    else if (tab === 'radar') targetUrl = '/accountability?tab=radar';
    else if (tab === 'insights') targetUrl = '/insights';
    else if (tab === 'graph') targetUrl = '/accountability?tab=graph';
    else if (tab === 'settings') targetUrl = '/settings';

    try {
      window.history.pushState({}, '', targetUrl);
      window.dispatchEvent(new Event('popstate'));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [dashboardOverview, setDashboardOverview] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [backendStatus, setBackendStatus] = useState<{
    isLive: boolean;
    service: string;
    ai_pipeline: string;
  }>({
    isLive: false,
    service: 'Connecting...',
    ai_pipeline: 'ready'
  });

  const [forceMockMode, setForceMockModeState] = useState<boolean>(() => {
    return localStorage.getItem('loopkeeper_force_mock') === 'true';
  });

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('loopkeeper_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark';
  });

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('loopkeeper_theme', next);
      return next;
    });
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const setForceMockMode = (enabled: boolean) => {
    setForceMockModeState(enabled);
    localStorage.setItem('loopkeeper_force_mock', String(enabled));
    api.setForceMockMode(enabled);
    addToast({
      type: 'info',
      title: enabled ? 'Demo Mock Mode Active' : 'Live API Mode Active',
      message: enabled
        ? 'Operating in simulated zero-crash demo mode.'
        : 'Connecting to FastAPI backend at /api/v1.'
    });
    refreshData();
  };

  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const health = await api.checkHealth();
      setBackendStatus({
        isLive: health.isLive,
        service: health.service,
        ai_pipeline: health.ai_pipeline
      });

      const [meetingsData, itemsData, overviewData] = await Promise.all([
        api.getMeetings(),
        api.getActionItems(),
        api.getDashboardOverview()
      ]);

      setMeetings(meetingsData);
      setActionItems(itemsData);
      setDashboardOverview(overviewData);
    } catch (err: any) {
      console.error('Failed to load application data', err);
      setError(err.message || 'An error occurred while loading data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const navigateToMeeting = (id: string) => {
    setSelectedMeetingId(id);
    setActiveTab('meeting-detail');
    try {
      window.history.pushState({}, '', `/meetings/${id}`);
      window.dispatchEvent(new Event('popstate'));
    } catch (e) {
      console.error(e);
    }
  };

  const navigateToTask = (id: string) => {
    setSelectedTaskId(id);
    setActiveTab('task-detail');
    try {
      window.history.pushState({}, '', `/commitments/${id}`);
      window.dispatchEvent(new Event('popstate'));
    } catch (e) {
      console.error(e);
    }
  };

  const createMeetingAndProcess = async (
    meetingData: MeetingCreate,
    transcriptData: TranscriptCreate,
    onStepUpdate?: (stepIndex: number, stepName: string) => void
  ) => {
    try {
      if (onStepUpdate) onStepUpdate(0, 'Creating meeting container & metadata...');
      const meeting = await api.createMeeting(meetingData);

      if (onStepUpdate) onStepUpdate(1, 'Uploading and sanitizing transcript text...');
      await api.attachTranscript(meeting.id, transcriptData);

      if (onStepUpdate) onStepUpdate(2, 'Executing SLM Provider extraction...');
      await new Promise(r => setTimeout(r, 600));

      if (onStepUpdate) onStepUpdate(3, 'Evaluating extraction confidence & fallback...');
      await new Promise(r => setTimeout(r, 450));

      if (onStepUpdate) onStepUpdate(4, 'Generating 1536-dim vector embeddings & vector similarity matching...');
      await new Promise(r => setTimeout(r, 550));

      const extractedItems = await api.processMeeting(meeting.id);

      if (onStepUpdate) onStepUpdate(5, 'Updating state engine and audit timeline...');
      await new Promise(r => setTimeout(r, 300));

      addToast({
        type: 'success',
        title: 'Meeting Ingested & Processed',
        message: `Extracted ${extractedItems.length} action items with AI pipeline.`
      });

      await refreshData();
      return { meeting, actionItems: extractedItems };
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'AI Processing Error',
        message: err.message || 'Failed to process meeting transcript.'
      });
      throw err;
    }
  };

  const deleteMeeting = async (id: string) => {
    try {
      await api.deleteMeeting(id);
      addToast({
        type: 'info',
        title: 'Meeting Deleted',
        message: 'Meeting and associated transcript removed successfully.'
      });
      await refreshData();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: err.message || 'Could not delete meeting.'
      });
    }
  };

  const updateTask = async (id: string, updates: ActionItemUpdate) => {
    try {
      const updated = await api.updateActionItem(id, updates);
      setActionItems(prev => prev.map(item => (item.id === id ? updated : item)));
      addToast({
        type: 'success',
        title: 'Action Item Updated',
        message: `Task state updated successfully.`
      });
      await refreshData();
      return updated;
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: err.message || 'Could not update action item.'
      });
      throw err;
    }
  };

  const createTask = async (data: { title: string; owner_name?: string; deadline?: string; description?: string }) => {
    try {
      const created = await api.createActionItem(data);
      setActionItems(prev => [created, ...prev]);
      addToast({
        type: 'success',
        title: 'Commitment Created',
        message: `Task "${created.title}" assigned to ${created.owner_name}.`
      });
      await refreshData();
      return created;
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Task Creation Failed',
        message: err.message || 'Could not create task.'
      });
      throw err;
    }
  };

  const resetDemoData = async () => {
    api.resetStore();
    addToast({
      type: 'info',
      title: 'Workspace Reset',
      message: 'Restored enterprise sample workspace data and action items.'
    });
    await refreshData();
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedMeetingId,
        setSelectedMeetingId,
        selectedTaskId,
        setSelectedTaskId,
        navigateToMeeting,
        navigateToTask,
        theme,
        toggleTheme,
        meetings,
        actionItems,
        dashboardOverview,
        loading,
        error,
        backendStatus,
        forceMockMode,
        setForceMockMode,
        toasts,
        addToast,
        removeToast,
        refreshData,
        createMeetingAndProcess,
        deleteMeeting,
        updateTask,
        createTask,
        resetDemoData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { RouterProvider, useRouter } from './context/RouterContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { ToastContainer } from './components/common/Toast';
import { DashboardView } from './components/dashboard/DashboardView';
import { MeetingList } from './components/meetings/MeetingList';
import { MeetingDetailView } from './components/meetings/MeetingDetailView';
import { CreateMeetingModal } from './components/meetings/CreateMeetingModal';
import { ActionItemList } from './components/tasks/ActionItemList';
import { CommitmentDetailView } from './components/tasks/CommitmentDetailView';
import { ActionItemDetailModal } from './components/tasks/ActionItemDetailModal';
import { WorkloadDashboard } from './components/workload/WorkloadDashboard';
import { AccountabilityHub } from './components/accountability/AccountabilityHub';
import { AccountabilityInsights } from './components/insights/AccountabilityInsights';
import { IntegrationsView } from './components/integrations/IntegrationsView';
import { RecordingSessionView } from './components/recording/RecordingSessionView';
import { SettingsView } from './components/settings/SettingsView';
import { AICopilotChatbot } from './components/common/AICopilotChatbot';
import {
  GaugeIcon,
  CalendarIcon,
  CheckSquareIcon,
  ShieldAlertIcon,
  NetworkIcon,
  SettingsIcon
} from './components/common/Icons';

const MainLayout: React.FC = () => {
  const { route, navigate, navigateToCommitment } = useRouter();

  const [isCreateMeetingOpen, setIsCreateMeetingOpen] = useState(false);
  const [initialPresetIndex, setInitialPresetIndex] = useState<number | undefined>(undefined);
  const [detailModalTaskId, setDetailModalTaskId] = useState<string | null>(null);

  const handleOpenCreateMeeting = (presetIdx?: number) => {
    setInitialPresetIndex(presetIdx);
    setIsCreateMeetingOpen(true);
  };

  const handleSelectTask = (taskId: string) => {
    navigateToCommitment(taskId);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-main)] flex flex-col font-sans relative overflow-x-hidden transition-colors duration-200">
      {/* Ambient Depth Background */}
      <div className="ambient-glow-bg">
        <div className="ambient-glow-orb-1" />
        <div className="ambient-glow-orb-2" />
        <div className="ambient-glow-orb-3" />
        <div className="absolute inset-0 bg-tech-grid opacity-30" />
      </div>

      {/* Navbar */}
      <Navbar onOpenCreateMeeting={() => handleOpenCreateMeeting()} />

      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Desktop Executive Sidebar */}
        <Sidebar />

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 h-[calc(100vh-4rem)]">
          <div className="max-w-7xl mx-auto">
            {route.path === 'dashboard' && (
              <DashboardView onOpenCreateMeeting={handleOpenCreateMeeting} />
            )}

            {route.path === 'meetings' && (
              <MeetingList onOpenCreateMeeting={handleOpenCreateMeeting} />
            )}

            {route.path === 'meeting-detail' && <MeetingDetailView />}

            {route.path === 'commitments' && (
              <ActionItemList onSelectTask={handleSelectTask} />
            )}

            {route.path === 'commitment-detail' && <CommitmentDetailView />}

            {route.path === 'accountability' && <AccountabilityHub />}

            {route.path === 'recording' && <RecordingSessionView />}

            {route.path === 'workload' && <WorkloadDashboard />}

            {route.path === 'insights' && <AccountabilityInsights />}

            {route.path === 'integrations' && <IntegrationsView />}

            {route.path === 'settings' && <SettingsView />}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden sticky bottom-0 z-40 w-full border-t border-white/[0.08] bg-zinc-950/95 backdrop-blur-md px-2 py-2 flex items-center justify-around text-[10px]">
        {[
          { path: '/dashboard', id: 'dashboard', label: 'Home', icon: GaugeIcon },
          { path: '/meetings', id: 'meetings', label: 'Meetings', icon: CalendarIcon },
          { path: '/commitments', id: 'commitments', label: 'Commitments', icon: CheckSquareIcon },
          { path: '/accountability', id: 'accountability', label: 'Accountability', icon: ShieldAlertIcon },
          { path: '/integrations', id: 'integrations', label: 'Integrations', icon: NetworkIcon },
          { path: '/settings', id: 'settings', label: 'Settings', icon: SettingsIcon }
        ].map(nav => {

          const Icon = nav.icon;
          const isActive =
            route.path === nav.id ||
            (route.path === 'meeting-detail' && nav.id === 'meetings') ||
            (route.path === 'commitment-detail' && nav.id === 'commitments');

          return (
            <button
              key={nav.id}
              onClick={() => navigate(nav.path)}
              className={`flex flex-col items-center gap-1 p-1.5 rounded-lg transition-colors ${
                isActive ? 'text-cyan-400 font-bold' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Icon size={18} />
              <span>{nav.label}</span>
            </button>
          );
        })}
      </div>

      {/* Global Ingest Meeting Modal */}
      <CreateMeetingModal
        isOpen={isCreateMeetingOpen}
        onClose={() => {
          setIsCreateMeetingOpen(false);
          setInitialPresetIndex(undefined);
        }}
        initialPresetIndex={initialPresetIndex}
      />

      {/* Optional Quick Task Detail / Edit Modal */}
      <ActionItemDetailModal
        taskId={detailModalTaskId}
        isOpen={detailModalTaskId !== null}
        onClose={() => {
          setDetailModalTaskId(null);
        }}
      />

      {/* AI Copilot Chatbot Layer */}
      <AICopilotChatbot />

      {/* Toast Notification Layer */}
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <RouterProvider>
            <MainLayout />
          </RouterProvider>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;


import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import type { NavigationTab } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { ToastContainer } from './components/common/Toast';
import { DashboardView } from './components/dashboard/DashboardView';
import { MeetingList } from './components/meetings/MeetingList';
import { MeetingDetailView } from './components/meetings/MeetingDetailView';
import { CreateMeetingModal } from './components/meetings/CreateMeetingModal';
import { ActionItemList } from './components/tasks/ActionItemList';
import { ActionItemDetailModal } from './components/tasks/ActionItemDetailModal';
import { WorkloadDashboard } from './components/workload/WorkloadDashboard';
import { PostponementRadar } from './components/insights/PostponementRadar';
import { AccountabilityInsights } from './components/insights/AccountabilityInsights';
import { AccountabilityGraph } from './components/graph/AccountabilityGraph';
import { SettingsView } from './components/settings/SettingsView';
import {
  GaugeIcon,
  CalendarIcon,
  CheckSquareIcon,
  NetworkIcon,
  UsersIcon,
  SettingsIcon
} from './components/common/Icons';

const MainLayout: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    selectedTaskId,
    setSelectedTaskId
  } = useApp();

  const [isCreateMeetingOpen, setIsCreateMeetingOpen] = useState(false);
  const [initialPresetIndex, setInitialPresetIndex] = useState<number | undefined>(undefined);
  const [detailModalTaskId, setDetailModalTaskId] = useState<string | null>(null);

  React.useEffect(() => {
    if (selectedTaskId) {
      setDetailModalTaskId(selectedTaskId);
    }
  }, [selectedTaskId]);

  const handleOpenCreateMeeting = (presetIdx?: number) => {
    setInitialPresetIndex(presetIdx);
    setIsCreateMeetingOpen(true);
  };

  const handleSelectTask = (taskId: string) => {
    setDetailModalTaskId(taskId);
    setSelectedTaskId(taskId);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-zinc-100 flex flex-col font-sans relative overflow-x-hidden">
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
            {activeTab === 'dashboard' && (
              <DashboardView onOpenCreateMeeting={handleOpenCreateMeeting} />
            )}

            {activeTab === 'meetings' && (
              <MeetingList onOpenCreateMeeting={handleOpenCreateMeeting} />
            )}

            {activeTab === 'meeting-detail' && <MeetingDetailView />}

            {(activeTab === 'tasks' || activeTab === 'task-detail') && (
              <ActionItemList onSelectTask={handleSelectTask} />
            )}

            {activeTab === 'radar' && <PostponementRadar />}

            {activeTab === 'workload' && <WorkloadDashboard />}

            {activeTab === 'graph' && <AccountabilityGraph />}

            {activeTab === 'insights' && <AccountabilityInsights />}

            {activeTab === 'settings' && <SettingsView />}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden sticky bottom-0 z-40 w-full border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-md px-2 py-2 flex items-center justify-around text-[10px]">
        {[
          { id: 'dashboard' as NavigationTab, label: 'Dashboard', icon: GaugeIcon },
          { id: 'meetings' as NavigationTab, label: 'Meetings', icon: CalendarIcon },
          { id: 'tasks' as NavigationTab, label: 'Tasks', icon: CheckSquareIcon },
          { id: 'graph' as NavigationTab, label: 'Graph', icon: NetworkIcon },
          { id: 'workload' as NavigationTab, label: 'Workload', icon: UsersIcon },
          { id: 'settings' as NavigationTab, label: 'Settings', icon: SettingsIcon }
        ].map(nav => {
          const Icon = nav.icon;
          const isActive =
            activeTab === nav.id ||
            (activeTab === 'meeting-detail' && nav.id === 'meetings') ||
            (activeTab === 'task-detail' && nav.id === 'tasks');

          return (
            <button
              key={nav.id}
              onClick={() => setActiveTab(nav.id)}
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

      {/* Global Task Detail / Edit Modal */}
      <ActionItemDetailModal
        taskId={detailModalTaskId}
        isOpen={detailModalTaskId !== null}
        onClose={() => {
          setDetailModalTaskId(null);
          setSelectedTaskId(null);
        }}
      />

      {/* Toast Notification Layer */}
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;

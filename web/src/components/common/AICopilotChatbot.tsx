import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from '../../context/RouterContext';
import {
  BrainIcon,
  SparklesIcon,
  XIcon,
  SendIcon,
  RefreshCwIcon,
  CheckCircleIcon
} from './Icons';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  actionTaken?: string;
  actionPayload?: any;
}

export const AICopilotChatbot: React.FC = () => {
  const { actionItems, meetings, updateTask } = useApp();
  const { employees, currentUser } = useAuth();
  const { navigate } = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'ai',
      text: `Hello ${currentUser.name}! I am LoopKeeper AI Copilot. I can execute actions across the entire platform — like rebalancing workload, verifying GitHub PRs, opening Jira connections, or analyzing execution drift.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsProcessing(true);

    setTimeout(async () => {
      const lower = query.toLowerCase();
      let aiText = '';
      let actionTaken = '';

      // Command Parsing Logic
      if (lower.includes('rebalance') || lower.includes('workload') || lower.includes('capacity')) {
        // Rebalance workload command
        const overloaded = employees.filter(emp => {
          const empItems = actionItems.filter(a => a.owner_employee_id === emp.id);
          const openCount = empItems.filter(a => a.status === 'pending').length;
          const overdueCount = empItems.filter(a => a.status === 'overdue').length;
          return openCount >= 3 || overdueCount >= 1;
        });

        if (overloaded.length > 0) {
          const source = overloaded[0];
          const target = employees.find(e => e.id !== source.id) || employees[1];
          const pendingTasks = actionItems.filter(a => a.owner_employee_id === source.id && a.status === 'pending');

          let count = 0;
          for (const t of pendingTasks.slice(0, 2)) {
            await updateTask(t.id, { owner_employee_id: target.id });
            count++;
          }

          aiText = `Executed AI Capacity Workload Rebalancer! Reallocated ${count} task(s) from ${source.name} ➔ ${target.name}. Workload index restored to balanced levels.`;
          actionTaken = 'workload_rebalanced';
          navigate('/workload');
        } else {
          aiText = `Checked cognitive capacity across all ${employees.length} team members. All workloads are currently balanced. Navigating to Workload Radar.`;
          navigate('/workload');
        }
      } else if (lower.includes('github') || lower.includes('pr') || lower.includes('proof of work')) {
        // Simulate GitHub PR verification command
        const pendingItem = actionItems.find(a => a.status === 'pending') || actionItems[0];
        if (pendingItem) {
          await updateTask(pendingItem.id, { status: 'done' });
          aiText = `Processed GitHub PR Webhook simulation for PR #42 ("fix: ${pendingItem.title}"). Vector AI matched task with 91.4% similarity and marked status as DONE!`;
          actionTaken = 'github_pr_verified';
          navigate('/commitments/' + pendingItem.id);
        } else {
          aiText = `No pending commitments to verify against GitHub PRs.`;
        }
      } else if (lower.includes('overload') || lower.includes('who is busy') || lower.includes('burnout')) {
        const overloaded = employees.filter(emp => {
          const empItems = actionItems.filter(a => a.owner_employee_id === emp.id);
          const openCount = empItems.filter(a => a.status === 'pending').length;
          const overdueCount = empItems.filter(a => a.status === 'overdue').length;
          return openCount >= 3 || overdueCount >= 1;
        });

        if (overloaded.length > 0) {
          aiText = `Detected ${overloaded.length} team member(s) with high/critical workload: ${overloaded.map(e => e.name).join(', ')}. Would you like me to run the AI Workload Rebalancer?`;
        } else {
          aiText = `All team members are operating within healthy capacity limits! No burnout risk detected.`;
        }
      } else if (lower.includes('drift') || lower.includes('radar') || lower.includes('overdue')) {
        const drifted = actionItems.filter(a => a.status === 'overdue' || (a.postponement_count || 0) >= 2);
        aiText = `Found ${drifted.length} commitment(s) with high execution drift or overdue status. Navigating to Execution Drift Radar.`;
        navigate('/accountability');
      } else if (lower.includes('graph') || lower.includes('lineage') || lower.includes('node')) {
        aiText = `Opening Cross-Meeting Node Lineage & Commitment Evolution Graph. Navigating to Accountability Graph.`;
        navigate('/graph');
      } else if (lower.includes('jira') || lower.includes('integration') || lower.includes('connect')) {
        aiText = `Opening Integrations & Execution Bridges portal. Atlassian Jira Cloud REST API v3 proxy is ready for credential input.`;
        navigate('/integrations');
      } else if (lower.includes('record') || lower.includes('meeting studio') || lower.includes('start recording')) {
        aiText = `Opening LoopKeeper Native Recording Studio. Ready to record live audio speech turns.`;
        navigate('/recording');
      } else if (lower.includes('summary') || lower.includes('ingested') || lower.includes('meetings')) {
        aiText = `You have ${meetings.length} ingested meetings and ${actionItems.length} commitments in your workspace. Latest meeting: "${meetings[0]?.title || 'Meeting Sync'}". Navigating to Meeting Hub.`;
        navigate('/meetings');
      } else {
        aiText = `Understood. I scanned your workspace: ${actionItems.filter(a => a.status === 'pending').length} active commitments, ${actionItems.filter(a => a.status === 'overdue').length} overdue items, and ${employees.length} team members. Ask me to rebalance workload, verify a PR, check drift, or navigate anywhere!`;
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionTaken
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsProcessing(false);
    }, 600);
  };

  const suggestionChips = [
    '⚡ Rebalance Workload',
    '🔗 Verify GitHub PR #42',
    '🚨 Show Execution Drift',
    '🕸️ Open Knowledge Graph',
    '🎙️ Start Recording'
  ];

  return (
    <>
      {/* Floating Chat Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs shadow-2xl shadow-indigo-500/40 border border-indigo-400/40 transition-all transform hover:scale-105 active:scale-95"
      >
        <div className="relative">
          <BrainIcon size={18} className="text-cyan-200 animate-pulse" />
          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-300 animate-ping" />
        </div>
        <span>Ask LoopKeeper AI</span>
        <SparklesIcon size={14} className="text-amber-300" />
      </button>

      {/* Expandable Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-20 right-5 z-50 w-full max-w-md h-[520px] rounded-3xl glass-panel-elevated border border-indigo-500/40 shadow-2xl flex flex-col justify-between overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-indigo-950/80 via-zinc-900 to-zinc-950 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
                <BrainIcon size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                  LoopKeeper AI Copilot
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    Full Platform Control
                  </span>
                </h3>
                <p className="text-[10px] text-zinc-400">Autonomous execution & voice assistant</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-xl hover:bg-zinc-800 transition-colors"
            >
              <XIcon size={18} />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-xs space-y-1.5 shadow-md ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-br-none'
                      : 'bg-zinc-900/90 border border-zinc-800 text-zinc-200 rounded-bl-none'
                  }`}
                >
                  {msg.sender === 'ai' && (
                    <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                      <SparklesIcon size={11} />
                      LoopKeeper AI
                    </div>
                  )}
                  <p className="leading-relaxed">{msg.text}</p>

                  {msg.actionTaken && (
                    <div className="pt-1.5 border-t border-zinc-800/80 text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircleIcon size={11} />
                      Action executed live in prototype
                    </div>
                  )}

                  <div className="text-[9px] font-mono text-zinc-400 text-right opacity-70">
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono p-2">
                <RefreshCwIcon size={14} className="animate-spin" />
                <span>LoopKeeper AI is analyzing request & executing platform actions...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion Chips */}
          <div className="p-2.5 bg-zinc-950/60 border-t border-zinc-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {suggestionChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip)}
                className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/80 whitespace-nowrap shrink-0 transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Ask AI or give command (e.g. 'rebalance workload')..."
              className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isProcessing}
              className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
            >
              <SendIcon size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

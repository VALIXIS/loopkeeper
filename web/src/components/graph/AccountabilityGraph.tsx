import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  NetworkIcon,
  SparklesIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  ClockIcon,
  UsersIcon,
  CalendarIcon,
  ArrowRightIcon,
  RefreshCwIcon,
  EyeIcon,
  LayersIcon
} from '../common/Icons';

interface GraphNode3D {
  id: string;
  label: string;
  type: 'core' | 'meeting' | 'commitment' | 'owner' | 'jira' | 'github';
  subLabel?: string;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  color: string;
  radius: number;
  connections: string[];
  payload?: any;
}

interface Particle3D {
  fromNodeId: string;
  toNodeId: string;
  progress: number;
  speed: number;
  color: string;
}

export const AccountabilityGraph: React.FC = () => {
  const { actionItems, meetings, navigateToTask } = useApp();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(actionItems[0]?.id || null);
  const [filterOwner, setFilterOwner] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'3d' | 'linear'>('3d');
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1.0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rotationRef = useRef({ x: 0.3, y: 0.5 });
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const hoveredNodeRef = useRef<GraphNode3D | null>(null);
  const nodesRef = useRef<GraphNode3D[]>([]);
  const particlesRef = useRef<Particle3D[]>([]);
  const animFrameIdRef = useRef<number | null>(null);

  const selectedItem = actionItems.find(a => a.id === selectedTaskId) || actionItems[0];
  const originMeeting = meetings.find(m => m.id === selectedItem?.meeting_id);
  const ownersList = Array.from(new Set(actionItems.map(a => a.owner_name).filter(Boolean)));

  const filteredItems = actionItems.filter(item => {
    if (filterOwner !== 'all' && item.owner_name !== filterOwner) return false;
    return true;
  });

  // Initialize 3D Graph Nodes & Connections
  useEffect(() => {
    const nodes: GraphNode3D[] = [];
    const particles: Particle3D[] = [];

    // Central Core Node
    const coreId = 'node-core-ai';
    nodes.push({
      id: coreId,
      label: 'LoopKeeper AI SLM Core',
      subLabel: '384-dim Vector Engine',
      type: 'core',
      x: 0,
      y: 0,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      color: '#6366f1',
      radius: 18,
      connections: []
    });

    // Add Meeting Nodes in an inner orbital ring
    const activeMeetings = meetings.slice(0, 5);
    const meetingCount = Math.max(1, activeMeetings.length);
    activeMeetings.forEach((m, idx) => {
      const angle = (idx / meetingCount) * Math.PI * 2;
      const r = 120;
      const mNodeId = `node-meeting-${m.id}`;
      nodes.push({
        id: mNodeId,
        label: m.title.length > 20 ? m.title.slice(0, 20) + '...' : m.title,
        subLabel: `Ingested ${new Date(m.meeting_date).toLocaleDateString()}`,
        type: 'meeting',
        x: Math.cos(angle) * r,
        y: (Math.sin(idx) * 30) - 20,
        z: Math.sin(angle) * r,
        vx: 0,
        vy: 0,
        vz: 0,
        color: '#818cf8',
        radius: 14,
        connections: [coreId],
        payload: m
      });
      nodes[0].connections.push(mNodeId);
    });

    // Add Commitment & Owner & Execution Nodes in outer orbital rings
    filteredItems.slice(0, 10).forEach((item, idx) => {
      const angle = (idx / Math.max(1, filteredItems.slice(0, 10).length)) * Math.PI * 2 + 0.3;
      const rCom = 220;
      const cNodeId = `node-com-${item.id}`;
      const mNodeId = `node-meeting-${item.meeting_id}`;

      // Commitment Node
      nodes.push({
        id: cNodeId,
        label: item.title.length > 22 ? item.title.slice(0, 22) + '...' : item.title,
        subLabel: `${Math.round(item.confidence * 100)}% Conf • ${item.status.toUpperCase()}`,
        type: 'commitment',
        x: Math.cos(angle) * rCom,
        y: Math.sin(angle * 2) * 50 + (idx % 2 === 0 ? 30 : -30),
        z: Math.sin(angle) * rCom,
        vx: 0,
        vy: 0,
        vz: 0,
        color: item.status === 'done' ? '#10b981' : item.status === 'overdue' ? '#f43f5e' : '#06b6d4',
        radius: 12,
        connections: [mNodeId || coreId],
        payload: item
      });

      // Owner Node (linked to commitment)
      const oNodeId = `node-owner-${item.owner_name?.toLowerCase().replace(/\s+/g, '-')}`;
      let ownerNode = nodes.find(n => n.id === oNodeId);
      if (!ownerNode) {
        const ownerAngle = angle + 0.4;
        const rOwner = 320;
        ownerNode = {
          id: oNodeId,
          label: item.owner_name || 'Assignee',
          subLabel: 'Responsible Lead',
          type: 'owner',
          x: Math.cos(ownerAngle) * rOwner,
          y: Math.sin(ownerAngle) * 40,
          z: Math.sin(ownerAngle) * rOwner,
          vx: 0,
          vy: 0,
          vz: 0,
          color: '#c084fc',
          radius: 13,
          connections: []
        };
        nodes.push(ownerNode);
      }
      ownerNode.connections.push(cNodeId);

      // Jira / GitHub Issue Node if synced
      if (item.jira_issue_key || item.id) {
        const jNodeId = `node-jira-${item.id}`;
        const rJira = 380;
        const jiraAngle = angle + 0.7;
        nodes.push({
          id: jNodeId,
          label: item.jira_issue_key || `LOOP-${101 + idx}`,
          subLabel: item.status === 'done' ? 'PR Verified' : 'Jira Synced',
          type: item.status === 'done' ? 'github' : 'jira',
          x: Math.cos(jiraAngle) * rJira,
          y: Math.sin(jiraAngle) * 60 + 20,
          z: Math.sin(jiraAngle) * rJira,
          vx: 0,
          vy: 0,
          vz: 0,
          color: item.status === 'done' ? '#34d399' : '#f59e0b',
          radius: 10,
          connections: [cNodeId],
          payload: item
        });
      }

      // Add animated pulse particle
      particles.push({
        fromNodeId: mNodeId || coreId,
        toNodeId: cNodeId,
        progress: Math.random(),
        speed: 0.005 + Math.random() * 0.008,
        color: '#06b6d4'
      });
    });

    nodesRef.current = nodes;
    particlesRef.current = particles;
  }, [actionItems, meetings, filterOwner]);

  // 3D Canvas Rendering Loop
  useEffect(() => {
    if (viewMode !== '3d') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = 540);

    const handleResize = () => {
      if (canvas && canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = 540;
      }
    };
    window.addEventListener('resize', handleResize);

    const render = () => {
      if (!ctx || !canvas) return;

      // Auto rotation
      if (isAutoRotate && !isDraggingRef.current) {
        rotationRef.current.y += 0.004;
      }

      ctx.clearRect(0, 0, width, height);

      // Background grid / cyber ambient glow
      const cx = width / 2;
      const cy = height / 2;

      const grad = ctx.createRadialGradient(cx, cy, 50, cx, cy, Math.max(width, height) / 1.2);
      grad.addColorStop(0, 'rgba(99, 102, 241, 0.07)');
      grad.addColorStop(0.5, 'rgba(6, 182, 212, 0.03)');
      grad.addColorStop(1, 'rgba(7, 9, 14, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // 3D Rotation matrices
      const rotX = rotationRef.current.x;
      const rotY = rotationRef.current.y;
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);

      const fov = 420 * zoomLevel;

      // Projected Nodes list with depth sorting
      const projectedNodes = nodesRef.current.map(n => {
        // Rotate Y
        let x1 = n.x * cosY - n.z * sinY;
        let z1 = n.x * sinY + n.z * cosY;

        // Rotate X
        let y1 = n.y * cosX - z1 * sinX;
        let z2 = n.y * sinX + z1 * cosX;

        // Perspective scale
        const cameraZ = 500;
        const depth = z2 + cameraZ;
        const scale = fov / Math.max(100, depth);

        const screenX = cx + x1 * scale;
        const screenY = cy + y1 * scale;

        return {
          node: n,
          screenX,
          screenY,
          scale,
          depth
        };
      });

      // Sort by depth (back to front)
      projectedNodes.sort((a, b) => b.depth - a.depth);

      // Map lookup
      const projectedMap = new Map(projectedNodes.map(p => [p.node.id, p]));

      // 1. Draw Connecting Laser Wires & Edges
      ctx.lineWidth = 1.2;
      projectedNodes.forEach(p => {
        const sourceNode = p.node;
        sourceNode.connections.forEach(targetId => {
          const targetP = projectedMap.get(targetId);
          if (targetP) {
            const isHighlightedPath =
              selectedTaskId &&
              (sourceNode.id.includes(selectedTaskId) || targetP.node.id.includes(selectedTaskId));

            ctx.beginPath();
            ctx.moveTo(p.screenX, p.screenY);

            // Curve edge in 3D
            const midX = (p.screenX + targetP.screenX) / 2;
            const midY = (p.screenY + targetP.screenY) / 2 - 15 * p.scale;
            ctx.quadraticCurveTo(midX, midY, targetP.screenX, targetP.screenY);

            if (isHighlightedPath) {
              ctx.strokeStyle = '#06b6d4';
              ctx.lineWidth = 2.5;
              ctx.shadowColor = '#06b6d4';
              ctx.shadowBlur = 10;
            } else {
              ctx.strokeStyle = 'rgba(99, 102, 241, 0.25)';
              ctx.lineWidth = 1;
              ctx.shadowBlur = 0;
            }
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
        });
      });

      // 2. Draw Data Flow Particles along edges
      particlesRef.current.forEach(pt => {
        pt.progress += pt.speed;
        if (pt.progress >= 1) pt.progress = 0;

        const fromP = projectedMap.get(pt.fromNodeId);
        const toP = projectedMap.get(pt.toNodeId);

        if (fromP && toP) {
          const px = fromP.screenX + (toP.screenX - fromP.screenX) * pt.progress;
          const py = fromP.screenY + (toP.screenY - fromP.screenY) * pt.progress;

          ctx.beginPath();
          ctx.arc(px, py, 3 * fromP.scale, 0, Math.PI * 2);
          ctx.fillStyle = pt.color;
          ctx.shadowColor = pt.color;
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // 3. Draw Nodes (Spheres + Labels)
      projectedNodes.forEach(p => {
        const { node, screenX, screenY, scale } = p;
        const isSelected = selectedTaskId && node.id.includes(selectedTaskId);
        const isHovered = hoveredNodeRef.current?.id === node.id;
        const rad = Math.max(4, node.radius * scale * (isSelected || isHovered ? 1.25 : 1));

        // Node Glow Halo
        if (isSelected || isHovered || node.type === 'core') {
          ctx.beginPath();
          ctx.arc(screenX, screenY, rad * 1.8, 0, Math.PI * 2);
          ctx.fillStyle = node.color + '33';
          ctx.fill();
        }

        // Main Node Circle
        ctx.beginPath();
        ctx.arc(screenX, screenY, rad, 0, Math.PI * 2);

        const nodeGrad = ctx.createRadialGradient(
          screenX - rad * 0.3,
          screenY - rad * 0.3,
          rad * 0.1,
          screenX,
          screenY,
          rad
        );
        nodeGrad.addColorStop(0, '#ffffff');
        nodeGrad.addColorStop(0.4, node.color);
        nodeGrad.addColorStop(1, '#0f172a');

        ctx.fillStyle = nodeGrad;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = isSelected ? 16 : 6;
        ctx.fill();
        ctx.strokeStyle = isSelected ? '#ffffff' : node.color;
        ctx.lineWidth = isSelected ? 2.5 : 1.2;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Label Text
        ctx.font = `${Math.max(9, Math.min(12, Math.round(11 * scale)))}px JetBrains Mono, monospace`;
        ctx.fillStyle = isSelected ? '#ffffff' : p.depth < 500 ? '#e2e8f0' : '#94a3b8';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, screenX, screenY + rad + 14 * scale);

        if (node.subLabel && scale > 0.75) {
          ctx.font = `${Math.max(8, Math.round(9 * scale))}px sans-serif`;
          ctx.fillStyle = '#64748b';
          ctx.fillText(node.subLabel, screenX, screenY + rad + 26 * scale);
        }
      });

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [viewMode, selectedTaskId, isAutoRotate, zoomLevel]);

  // Mouse Interaction Handlers for 3D Drag & Selection
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isDraggingRef.current) {
      const deltaX = e.clientX - lastMousePosRef.current.x;
      const deltaY = e.clientY - lastMousePosRef.current.y;
      rotationRef.current.y += deltaX * 0.008;
      rotationRef.current.x += deltaY * 0.008;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    } else {
      // Hover detection
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const rotX = rotationRef.current.x;
      const rotY = rotationRef.current.y;
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      const fov = 420 * zoomLevel;

      let foundHover: GraphNode3D | null = null;
      for (const n of nodesRef.current) {
        let x1 = n.x * cosY - n.z * sinY;
        let z1 = n.x * sinY + n.z * cosY;
        let y1 = n.y * cosX - z1 * sinX;
        let z2 = n.y * sinX + z1 * cosX;
        const scale = fov / Math.max(100, z2 + 500);
        const screenX = cx + x1 * scale;
        const screenY = cy + y1 * scale;

        const dist = Math.hypot(mouseX - screenX, mouseY - screenY);
        if (dist <= n.radius * scale * 1.5) {
          foundHover = n;
          break;
        }
      }
      hoveredNodeRef.current = foundHover;
      canvas.style.cursor = foundHover ? 'pointer' : 'grab';
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleCanvasClick = () => {
    if (hoveredNodeRef.current) {
      const node = hoveredNodeRef.current;
      if (node.payload?.id) {
        setSelectedTaskId(node.payload.id);
      }
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in-up">
      {/* Sleek Compact Header Bar */}
      <div className="rounded-2xl glass-panel border border-indigo-500/40 p-4 sm:px-5 sm:py-3.5 shadow-lg space-y-3 backdrop-blur-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-md shadow-indigo-500/25 flex items-center gap-1.5 font-mono shrink-0">
              <NetworkIcon size={14} className="text-cyan-300 animate-pulse" />
              Accountability Knowledge Graph
            </span>
            <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Interactive 3D Lineage & Commitment Evolution
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('3d')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === '3d'
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-md'
                  : 'bg-slate-200 dark:bg-zinc-900 text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              <EyeIcon size={13} />
              <span>3D Knowledge Graph</span>
            </button>
            <button
              onClick={() => setViewMode('linear')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'linear'
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-md'
                  : 'bg-slate-200 dark:bg-zinc-900 text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              <LayersIcon size={13} />
              <span>Linear Matrix</span>
            </button>
          </div>
        </div>

        {/* Legend & Filter Controls */}
        <div className="pt-2 border-t border-slate-200 dark:border-white/[0.08] flex flex-wrap items-center justify-between gap-4 text-xs relative z-10">
          <div className="flex flex-wrap items-center gap-4 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/50 animate-pulse" /> 1. Meeting
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50" /> 2. Commitment
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-purple-400 shadow-sm shadow-purple-400/50" /> 3. Owner
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" /> 4. Jira Issue
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" /> 5. GitHub PR
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-600 dark:text-slate-400 text-xs">Filter Assignee:</span>
            <select
              value={filterOwner}
              onChange={e => setFilterOwner(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-indigo-500 font-sans"
            >
              <option value="all">All Assignees</option>
              {ownersList.map(name => (
                <option key={name} value={name!}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3D Knowledge Graph Visualizer Canvas */}
      {viewMode === '3d' ? (
        <div className="relative rounded-3xl bg-slate-950 border border-indigo-500/30 overflow-hidden shadow-2xl">
          {/* Canvas Controls Overlay */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-zinc-800 shadow-lg text-xs">
            <button
              onClick={() => setIsAutoRotate(!isAutoRotate)}
              className={`px-3 py-1.5 rounded-xl font-mono text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                isAutoRotate
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <RefreshCwIcon size={12} className={isAutoRotate ? 'animate-spin' : ''} />
              <span>{isAutoRotate ? 'Auto-Spin ON' : 'Auto-Spin OFF'}</span>
            </button>

            <button
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 2.0))}
              className="px-2.5 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 font-bold"
              title="Zoom In"
            >
              +
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.5))}
              className="px-2.5 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 font-bold"
              title="Zoom Out"
            >
              -
            </button>
            <button
              onClick={() => {
                rotationRef.current = { x: 0.3, y: 0.5 };
                setZoomLevel(1.0);
              }}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 font-mono text-[11px] font-semibold"
            >
              Reset View
            </button>
          </div>

          <div className="absolute top-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md p-2.5 rounded-2xl border border-zinc-800 shadow-lg text-[11px] font-mono text-zinc-300 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-cyan-400">
              <SparklesIcon size={13} />
              <span>3D Orbit Canvas Instructions</span>
            </div>
            <p className="text-zinc-400 text-[10px]">
              • Drag mouse to rotate 3D graph perspective.<br />
              • Click on node to trace execution path in 3D.<br />
              • Orbit nodes illustrate meeting-to-code lineage.
            </p>
          </div>

          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={handleCanvasClick}
            className="w-full h-[540px] block"
          />
        </div>
      ) : (
        /* Linear Matrix View (Table / Column layout) */
        <div className="rounded-3xl bg-slate-100/90 dark:bg-slate-950/90 border border-slate-200 dark:border-white/[0.08] p-6 overflow-x-auto shadow-2xl backdrop-blur-xl">
          <div className="min-w-[1000px] grid grid-cols-6 gap-4 pb-4 border-b border-slate-200 dark:border-white/[0.08] text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-center font-mono">
            <div className="flex items-center justify-center gap-1.5 text-indigo-600 dark:text-indigo-400">
              <CalendarIcon size={14} />
              <span>1. Meeting</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-cyan-600 dark:text-cyan-400">
              <SparklesIcon size={14} />
              <span>2. Commitment</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-purple-600 dark:text-purple-400">
              <UsersIcon size={14} />
              <span>3. Owner</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-amber-600 dark:text-amber-400">
              <ClockIcon size={14} />
              <span>4. Deadline</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-rose-600 dark:text-rose-400">
              <AlertTriangleIcon size={14} />
              <span>5. Drift</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <CheckCircleIcon size={14} />
              <span>6. Outcome</span>
            </div>
          </div>

          <div className="min-w-[1000px] space-y-4 pt-6">
            {filteredItems.map(item => {
              const isSelected = item.id === selectedTaskId;
              const origin = meetings.find(m => m.id === item.meeting_id);
              const isDone = item.status === 'done';
              const isOverdue = item.status === 'overdue';
              const hasPostponement = (item.postponement_count || 0) > 0;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedTaskId(item.id)}
                  className={`group cursor-pointer rounded-2xl p-3.5 border transition-all duration-300 grid grid-cols-6 gap-3 items-center relative ${
                    isSelected
                      ? 'bg-indigo-50/70 dark:bg-gradient-to-r dark:from-indigo-950/70 dark:via-slate-900/90 dark:to-slate-900 border-cyan-500 ring-2 ring-cyan-500/40 shadow-xl shadow-cyan-500/15 scale-[1.01]'
                      : 'glass-panel border-slate-200 dark:border-white/[0.06] hover:bg-slate-200/50 dark:hover:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950/90 border border-indigo-500/30 text-left space-y-1 shadow-inner">
                    <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold block truncate">
                      {origin?.source.toUpperCase() || 'MEETING'}
                    </span>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-200 truncate" title={origin?.title}>
                      {origin?.title || item.meeting_title || 'Meeting'}
                    </div>
                    <span className="text-[10px] text-slate-500 block font-mono">
                      {origin ? new Date(origin.meeting_date).toLocaleDateString() : ''}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950/90 border border-cyan-500/30 text-left space-y-1 shadow-inner">
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-2" title={item.title}>
                      {item.title}
                    </div>
                    <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono block">
                      {Math.round(item.confidence * 100)}% Conf
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950/90 border border-purple-500/30 text-center space-y-1 shadow-inner">
                    <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 text-white font-bold text-xs flex items-center justify-center mx-auto shadow-sm">
                      {item.owner_name?.charAt(0) || 'U'}
                    </div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-slate-200 truncate">
                      {item.owner_name}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950/90 border border-amber-500/30 text-center space-y-1 shadow-inner">
                    <span className="text-[10px] text-slate-500 uppercase block font-bold">Target</span>
                    <div className="text-xs font-mono font-bold text-amber-700 dark:text-amber-300">
                      {item.deadline
                        ? new Date(item.deadline).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })
                        : 'None'}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950/90 border border-slate-200 dark:border-white/[0.08] text-center space-y-1 shadow-inner">
                    {hasPostponement ? (
                      <div className="space-y-0.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 block font-mono">
                          {item.postponement_count}x Postponed
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Deadline Drifted</span>
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 block font-mono">
                          No Slippage
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">On Schedule</span>
                      </div>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950/90 border border-slate-200 dark:border-white/[0.08] text-center space-y-1 shadow-inner">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-block font-mono ${
                        isDone
                          ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40'
                          : isOverdue
                          ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/40 animate-pulse'
                          : 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {isDone ? 'COMPLETED' : isOverdue ? 'OVERDUE' : 'IN PROGRESS'}
                    </span>
                    <span className="text-[10px] text-slate-500 block font-mono">
                      {isDone ? 'Verified Done' : 'Active'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Node Inspector Drawer */}
      {selectedItem && (
        <div className="p-6 rounded-3xl glass-panel-elevated border border-slate-200 dark:border-white/[0.08] space-y-4 shadow-2xl backdrop-blur-xl animate-fade-in-up">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <SparklesIcon size={18} className="text-cyan-600 dark:text-cyan-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                3D Lineage Inspection: "{selectedItem.title}"
              </h3>
            </div>

            <button
              onClick={() => navigateToTask(selectedItem.id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all hover:scale-105 active:scale-95"
            >
              <span>Full Audit Timeline</span>
              <ArrowRightIcon size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/[0.06]">
              <span className="text-slate-500 dark:text-slate-400 block font-semibold text-[11px]">Originating Meeting</span>
              <span className="text-slate-900 dark:text-slate-200 font-bold block mt-1">
                {originMeeting?.title || selectedItem.meeting_title || 'Meeting'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/[0.06]">
              <span className="text-slate-500 dark:text-slate-400 block font-semibold text-[11px]">Responsible Owner</span>
              <span className="text-slate-900 dark:text-slate-200 font-bold block mt-1">
                {selectedItem.owner_name}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/[0.06]">
              <span className="text-slate-500 dark:text-slate-400 block font-semibold text-[11px]">Deduplication Matching</span>
              <span className="text-cyan-700 dark:text-cyan-400 font-bold block mt-1 font-mono">
                {selectedItem.match_reason || 'Identified as new commitment'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/[0.06]">
              <span className="text-slate-500 dark:text-slate-400 block font-semibold text-[11px]">Postponement History</span>
              <span
                className={`font-bold block mt-1 font-mono ${
                  (selectedItem.postponement_count || 0) >= 2 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {(selectedItem.postponement_count || 0)} Recorded Slippage Events
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect, useRef, useId } from 'react';
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
  LayersIcon,
  SearchIcon
} from '../common/Icons';

export interface GraphNode3D {
  id: string;
  label: string;
  type: 'core' | 'meeting' | 'commitment' | 'owner' | 'jira' | 'github';
  subLabel?: string;
  x: number;
  y: number;
  z: number;
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
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const [filterOwner, setFilterOwner] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'3d' | 'linear'>('3d');
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [hoveredNode, setHoveredNode] = useState<{ node: GraphNode3D; x: number; y: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Smooth rotation physics targets & current values
  const rotationRef = useRef({
    currentX: 0.35,
    currentY: 0.5,
    targetX: 0.35,
    targetY: 0.5,
    velX: 0,
    velY: 0
  });

  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const nodesRef = useRef<GraphNode3D[]>([]);
  const particlesRef = useRef<Particle3D[]>([]);
  const animFrameIdRef = useRef<number | null>(null);
  const ariaAnnouncementId = useId();

  const selectedItem = actionItems.find(a => a.id === selectedTaskId) || actionItems[0];
  const originMeeting = meetings.find(m => m.id === selectedItem?.meeting_id);
  const ownersList = Array.from(new Set(actionItems.map(a => a.owner_name).filter(Boolean)));

  // Filter items
  const filteredItems = actionItems.filter(item => {
    if (filterOwner !== 'all' && item.owner_name !== filterOwner) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchOwner = item.owner_name?.toLowerCase().includes(q);
      if (!matchTitle && !matchOwner) return false;
    }
    return true;
  });

  // Initialize 3D Graph Nodes & Connections
  useEffect(() => {
    const nodes: GraphNode3D[] = [];
    const particles: Particle3D[] = [];

    // Central Core Node
    const coreId = 'node-core-ai';
    if (filterType === 'all' || filterType === 'core') {
      nodes.push({
        id: coreId,
        label: 'LoopKeeper AI Core',
        subLabel: '384-dim Vector Engine',
        type: 'core',
        x: 0,
        y: 0,
        z: 0,
        color: '#6366f1',
        radius: 20,
        connections: []
      });
    }

    // Add Meeting Nodes in an inner orbital ring
    const activeMeetings = meetings.slice(0, 6);
    const meetingCount = Math.max(1, activeMeetings.length);

    if (filterType === 'all' || filterType === 'meeting') {
      activeMeetings.forEach((m, idx) => {
        const angle = (idx / meetingCount) * Math.PI * 2;
        const r = 130;
        const mNodeId = `node-meeting-${m.id}`;
        nodes.push({
          id: mNodeId,
          label: m.title.length > 22 ? m.title.slice(0, 22) + '...' : m.title,
          subLabel: `Ingested ${new Date(m.meeting_date).toLocaleDateString()}`,
          type: 'meeting',
          x: Math.cos(angle) * r,
          y: Math.sin(idx * 1.5) * 35 - 15,
          z: Math.sin(angle) * r,
          color: '#818cf8',
          radius: 15,
          connections: nodes.some(n => n.id === coreId) ? [coreId] : [],
          payload: m
        });
        if (nodes[0] && nodes[0].id === coreId) {
          nodes[0].connections.push(mNodeId);
        }
      });
    }

    // Add Commitment & Owner & Execution Nodes in outer orbital rings
    filteredItems.slice(0, 12).forEach((item, idx) => {
      const angle = (idx / Math.max(1, filteredItems.slice(0, 12).length)) * Math.PI * 2 + 0.4;
      const rCom = 230;
      const cNodeId = `node-com-${item.id}`;
      const mNodeId = `node-meeting-${item.meeting_id}`;

      if (filterType === 'all' || filterType === 'commitment') {
        nodes.push({
          id: cNodeId,
          label: item.title.length > 24 ? item.title.slice(0, 24) + '...' : item.title,
          subLabel: `${Math.round(item.confidence * 100)}% Conf • ${item.status.toUpperCase()}`,
          type: 'commitment',
          x: Math.cos(angle) * rCom,
          y: Math.sin(angle * 2.5) * 60 + (idx % 2 === 0 ? 35 : -35),
          z: Math.sin(angle) * rCom,
          color: item.status === 'done' ? '#10b981' : item.status === 'overdue' ? '#f43f5e' : '#06b6d4',
          radius: 13,
          connections: nodes.some(n => n.id === mNodeId) ? [mNodeId] : (nodes.some(n => n.id === coreId) ? [coreId] : []),
          payload: item
        });
      }

      // Owner Node (linked to commitment)
      if (filterType === 'all' || filterType === 'owner') {
        const oNodeId = `node-owner-${item.owner_name?.toLowerCase().replace(/\s+/g, '-')}`;
        let ownerNode = nodes.find(n => n.id === oNodeId);
        if (!ownerNode) {
          const ownerAngle = angle + 0.45;
          const rOwner = 330;
          ownerNode = {
            id: oNodeId,
            label: item.owner_name || 'Assignee',
            subLabel: 'Responsible Lead',
            type: 'owner',
            x: Math.cos(ownerAngle) * rOwner,
            y: Math.sin(ownerAngle * 1.8) * 45,
            z: Math.sin(ownerAngle) * rOwner,
            color: '#c084fc',
            radius: 14,
            connections: []
          };
          nodes.push(ownerNode);
        }
        if (nodes.some(n => n.id === cNodeId)) {
          ownerNode.connections.push(cNodeId);
        }
      }

      // Jira / GitHub Issue Node if synced
      if ((filterType === 'all' || filterType === 'jira' || filterType === 'github') && (item.jira_issue_key || item.id)) {
        const jNodeId = `node-jira-${item.id}`;
        const rJira = 390;
        const jiraAngle = angle + 0.75;
        nodes.push({
          id: jNodeId,
          label: item.jira_issue_key || `LOOP-${101 + idx}`,
          subLabel: item.status === 'done' ? 'GitHub PR Verified' : 'Jira Ticket Synced',
          type: item.status === 'done' ? 'github' : 'jira',
          x: Math.cos(jiraAngle) * rJira,
          y: Math.sin(jiraAngle * 2) * 65 + 20,
          z: Math.sin(jiraAngle) * rJira,
          color: item.status === 'done' ? '#34d399' : '#f59e0b',
          radius: 11,
          connections: nodes.some(n => n.id === cNodeId) ? [cNodeId] : [],
          payload: item
        });
      }

      // Add animated pulse particle
      if (nodes.some(n => n.id === cNodeId)) {
        particles.push({
          fromNodeId: nodes.some(n => n.id === mNodeId) ? mNodeId : coreId,
          toNodeId: cNodeId,
          progress: Math.random(),
          speed: 0.004 + Math.random() * 0.007,
          color: item.status === 'done' ? '#10b981' : '#06b6d4'
        });
      }
    });

    nodesRef.current = nodes;
    particlesRef.current = particles;
    if (nodes.length > 0 && !focusedNodeId) {
      setFocusedNodeId(nodes[0].id);
    }
  }, [actionItems, meetings, filterOwner, filterType, searchQuery]);

  // High-DPI Canvas Rendering & Physics Engine Loop
  useEffect(() => {
    if (viewMode !== '3d') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = 540 * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `540px`;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      if (!ctx || !canvas || !canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      const cssWidth = rect.width;
      const cssHeight = 540;

      // Smooth Physics & Rotation Lerp
      const rot = rotationRef.current;
      if (isAutoRotate && !isDraggingRef.current) {
        rot.targetY += 0.003;
      }

      if (!isDraggingRef.current && (Math.abs(rot.velX) > 0.0001 || Math.abs(rot.velY) > 0.0001)) {
        rot.targetX += rot.velX;
        rot.targetY += rot.velY;
        rot.velX *= 0.92;
        rot.velY *= 0.92;
      }

      rot.currentX += (rot.targetX - rot.currentX) * 0.12;
      rot.currentY += (rot.targetY - rot.currentY) * 0.12;

      ctx.clearRect(0, 0, cssWidth, cssHeight);

      // Cyber ambient background grid gradient
      const cx = cssWidth / 2;
      const cy = cssHeight / 2;

      const grad = ctx.createRadialGradient(cx, cy, 60, cx, cy, Math.max(cssWidth, cssHeight) / 1.1);
      grad.addColorStop(0, 'rgba(99, 102, 241, 0.09)');
      grad.addColorStop(0.5, 'rgba(6, 182, 212, 0.04)');
      grad.addColorStop(1, 'rgba(7, 9, 14, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, cssWidth, cssHeight);

      // 3D Rotation matrices
      const cosX = Math.cos(rot.currentX), sinX = Math.sin(rot.currentX);
      const cosY = Math.cos(rot.currentY), sinY = Math.sin(rot.currentY);
      const fov = 440 * zoomLevel;

      // Projected Nodes list with depth sorting
      const projectedNodes = nodesRef.current.map(n => {
        let x1 = n.x * cosY - n.z * sinY;
        let z1 = n.x * sinY + n.z * cosY;
        let y1 = n.y * cosX - z1 * sinX;
        let z2 = n.y * sinX + z1 * cosX;

        const cameraZ = 520;
        const depth = z2 + cameraZ;
        const scale = fov / Math.max(120, depth);

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

      // Sort by depth (back to front for proper z-index rendering)
      projectedNodes.sort((a, b) => b.depth - a.depth);
      const projectedMap = new Map(projectedNodes.map(p => [p.node.id, p]));

      // 1. Draw 3D Curved Beam Connections
      projectedNodes.forEach(p => {
        const sourceNode = p.node;
        sourceNode.connections.forEach(targetId => {
          const targetP = projectedMap.get(targetId);
          if (targetP) {
            const isHighlightedPath =
              (selectedTaskId && (sourceNode.id.includes(selectedTaskId) || targetP.node.id.includes(selectedTaskId))) ||
              (focusedNodeId && (sourceNode.id === focusedNodeId || targetP.node.id === focusedNodeId));

            ctx.beginPath();
            ctx.moveTo(p.screenX, p.screenY);

            const midX = (p.screenX + targetP.screenX) / 2;
            const midY = (p.screenY + targetP.screenY) / 2 - 18 * p.scale;
            ctx.quadraticCurveTo(midX, midY, targetP.screenX, targetP.screenY);

            if (isHighlightedPath) {
              ctx.strokeStyle = '#06b6d4';
              ctx.lineWidth = 2.8;
              ctx.shadowColor = '#06b6d4';
              ctx.shadowBlur = 12;
            } else {
              ctx.strokeStyle = 'rgba(99, 102, 241, 0.28)';
              ctx.lineWidth = Math.max(0.8, 1.2 * p.scale);
              ctx.shadowBlur = 0;
            }
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
        });
      });

      // 2. Draw Data Flow Pulse Particles
      particlesRef.current.forEach(pt => {
        pt.progress += pt.speed;
        if (pt.progress >= 1) pt.progress = 0;

        const fromP = projectedMap.get(pt.fromNodeId);
        const toP = projectedMap.get(pt.toNodeId);

        if (fromP && toP) {
          const px = fromP.screenX + (toP.screenX - fromP.screenX) * pt.progress;
          const py = fromP.screenY + (toP.screenY - fromP.screenY) * pt.progress;

          ctx.beginPath();
          ctx.arc(px, py, Math.max(2, 3.5 * fromP.scale), 0, Math.PI * 2);
          ctx.fillStyle = pt.color;
          ctx.shadowColor = pt.color;
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // 3. Draw Nodes with Distinct 3D Geometry
      projectedNodes.forEach(p => {
        const { node, screenX, screenY, scale } = p;
        const isSelected = selectedTaskId && node.id.includes(selectedTaskId);
        const isFocused = focusedNodeId === node.id;
        const isHovered = hoveredNode?.node.id === node.id;
        const rad = Math.max(5, node.radius * scale * (isSelected || isFocused || isHovered ? 1.3 : 1));

        // Node Glow Aura
        if (isSelected || isFocused || isHovered || node.type === 'core') {
          ctx.beginPath();
          ctx.arc(screenX, screenY, rad * 2.0, 0, Math.PI * 2);
          ctx.fillStyle = node.color + '40';
          ctx.fill();
        }

        // Custom shape rendering according to node type
        ctx.beginPath();
        if (node.type === 'core') {
          // Core Node: Pulsing Concentric Nucleus
          ctx.arc(screenX, screenY, rad, 0, Math.PI * 2);
          const nodeGrad = ctx.createRadialGradient(screenX - rad * 0.3, screenY - rad * 0.3, rad * 0.1, screenX, screenY, rad);
          nodeGrad.addColorStop(0, '#ffffff');
          nodeGrad.addColorStop(0.5, '#6366f1');
          nodeGrad.addColorStop(1, '#1e1b4b');
          ctx.fillStyle = nodeGrad;
          ctx.shadowColor = '#6366f1';
          ctx.shadowBlur = 20;
          ctx.fill();
          ctx.strokeStyle = '#a5b4fc';
          ctx.lineWidth = 2.5;
          ctx.stroke();
        } else if (node.type === 'meeting') {
          // Meeting Node: Rounded Glass Capsule
          const w = rad * 2.2;
          const h = rad * 1.4;
          if (ctx.roundRect) {
            ctx.roundRect(screenX - w / 2, screenY - h / 2, w, h, 8 * scale);
          } else {
            ctx.rect(screenX - w / 2, screenY - h / 2, w, h);
          }
          const nodeGrad = ctx.createLinearGradient(screenX - w / 2, screenY - h / 2, screenX + w / 2, screenY + h / 2);
          nodeGrad.addColorStop(0, '#818cf8');
          nodeGrad.addColorStop(1, '#3730a3');
          ctx.fillStyle = nodeGrad;
          ctx.shadowColor = '#818cf8';
          ctx.shadowBlur = isSelected ? 16 : 8;
          ctx.fill();
          ctx.strokeStyle = '#c7d2fe';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else if (node.type === 'owner') {
          // Owner Node: Octagon Badge
          const sides = 8;
          for (let i = 0; i < sides; i++) {
            const a = (i / sides) * Math.PI * 2;
            const px = screenX + Math.cos(a) * rad;
            const py = screenY + Math.sin(a) * rad;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fillStyle = '#c084fc';
          ctx.shadowColor = '#c084fc';
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.strokeStyle = '#f0abfc';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else if (node.type === 'jira' || node.type === 'github') {
          // Integration Node: Diamond
          ctx.moveTo(screenX, screenY - rad * 1.2);
          ctx.lineTo(screenX + rad * 1.2, screenY);
          ctx.lineTo(screenX, screenY + rad * 1.2);
          ctx.lineTo(screenX - rad * 1.2, screenY);
          ctx.closePath();
          ctx.fillStyle = node.color;
          ctx.shadowColor = node.color;
          ctx.shadowBlur = 12;
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else {
          // Commitment Node: Sphere with Confidence Gauge Ring
          ctx.arc(screenX, screenY, rad, 0, Math.PI * 2);
          const nodeGrad = ctx.createRadialGradient(screenX - rad * 0.3, screenY - rad * 0.3, rad * 0.1, screenX, screenY, rad);
          nodeGrad.addColorStop(0, '#ffffff');
          nodeGrad.addColorStop(0.4, node.color);
          nodeGrad.addColorStop(1, '#0f172a');
          ctx.fillStyle = nodeGrad;
          ctx.shadowColor = node.color;
          ctx.shadowBlur = isSelected ? 18 : 8;
          ctx.fill();
          ctx.strokeStyle = isSelected || isFocused ? '#ffffff' : node.color;
          ctx.lineWidth = isSelected ? 2.5 : 1.2;
          ctx.stroke();
        }

        ctx.shadowBlur = 0;

        // Label Text Badge
        if (scale > 0.45) {
          const fontSize = Math.max(9, Math.min(13, Math.round(11 * scale)));
          ctx.font = `bold ${fontSize}px JetBrains Mono, monospace`;
          const textWidth = ctx.measureText(node.label).width;
          const paddingX = 8 * scale;
          const paddingY = 3 * scale;
          const badgeY = screenY + rad + 8 * scale;

          ctx.fillStyle = isSelected || isFocused ? 'rgba(79, 70, 229, 0.9)' : 'rgba(15, 23, 42, 0.85)';
          ctx.strokeStyle = isSelected || isFocused ? '#c7d2fe' : 'rgba(255, 255, 255, 0.2)';
          ctx.lineWidth = 1;

          if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(screenX - textWidth / 2 - paddingX, badgeY, textWidth + paddingX * 2, fontSize + paddingY * 2, 6);
            ctx.fill();
            ctx.stroke();
          } else {
            ctx.fillRect(screenX - textWidth / 2 - paddingX, badgeY, textWidth + paddingX * 2, fontSize + paddingY * 2);
          }

          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.fillText(node.label, screenX, badgeY + fontSize);

          if (node.subLabel && scale > 0.75) {
            ctx.font = `${Math.max(8, Math.round(9 * scale))}px sans-serif`;
            ctx.fillStyle = '#cbd5e1';
            ctx.fillText(node.subLabel, screenX, badgeY + fontSize + 14 * scale);
          }
        }
      });

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [viewMode, selectedTaskId, focusedNodeId, isAutoRotate, zoomLevel, hoveredNode]);

  // Mouse Interaction Handlers for Orbit Rotation & Selection
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
      rotationRef.current.velY = deltaX * 0.006;
      rotationRef.current.velX = deltaY * 0.006;
      rotationRef.current.targetY += rotationRef.current.velY;
      rotationRef.current.targetX += rotationRef.current.velX;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    } else {
      // Hover node detection
      const cssWidth = rect.width;
      const cssHeight = 540;
      const cx = cssWidth / 2;
      const cy = cssHeight / 2;
      const rot = rotationRef.current;
      const cosX = Math.cos(rot.currentX), sinX = Math.sin(rot.currentX);
      const cosY = Math.cos(rot.currentY), sinY = Math.sin(rot.currentY);
      const fov = 440 * zoomLevel;

      let found: GraphNode3D | null = null;
      let foundX = 0, foundY = 0;

      for (const n of nodesRef.current) {
        let x1 = n.x * cosY - n.z * sinY;
        let z1 = n.x * sinY + n.z * cosY;
        let y1 = n.y * cosX - z1 * sinX;
        let z2 = n.y * sinX + z1 * cosX;
        const scale = fov / Math.max(120, z2 + 520);
        const screenX = cx + x1 * scale;
        const screenY = cy + y1 * scale;

        const dist = Math.hypot(mouseX - screenX, mouseY - screenY);
        if (dist <= n.radius * scale * 1.6) {
          found = n;
          foundX = screenX;
          foundY = screenY;
          break;
        }
      }

      if (found) {
        setHoveredNode({ node: found, x: foundX, y: foundY });
        canvas.style.cursor = 'pointer';
      } else {
        setHoveredNode(null);
        canvas.style.cursor = 'grab';
      }
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleCanvasClick = () => {
    if (hoveredNode) {
      const node = hoveredNode.node;
      setFocusedNodeId(node.id);
      if (node.payload?.id) {
        setSelectedTaskId(node.payload.id);
      }
    }
  };

  // Keyboard navigation for full accessibility
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (nodesRef.current.length === 0) return;
    const currentIndex = nodesRef.current.findIndex(n => n.id === focusedNodeId);

    if (e.key === 'ArrowRight' || e.key === 'Tab') {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % nodesRef.current.length;
      const nextNode = nodesRef.current[nextIndex];
      setFocusedNodeId(nextNode.id);
      if (nextNode.payload?.id) setSelectedTaskId(nextNode.payload.id);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + nodesRef.current.length) % nodesRef.current.length;
      const prevNode = nodesRef.current[prevIndex];
      setFocusedNodeId(prevNode.id);
      if (prevNode.payload?.id) setSelectedTaskId(prevNode.payload.id);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const node = nodesRef.current.find(n => n.id === focusedNodeId);
      if (node?.payload?.id) {
        setSelectedTaskId(node.payload.id);
      }
    } else if (e.key === 'r' || e.key === 'R') {
      rotationRef.current.targetX = 0.35;
      rotationRef.current.targetY = 0.5;
      setZoomLevel(1.0);
    } else if (e.key === 's' || e.key === 'S') {
      setIsAutoRotate(prev => !prev);
    } else if (e.key === '+' || e.key === '=') {
      setZoomLevel(prev => Math.min(prev + 0.25, 2.0));
    } else if (e.key === '-') {
      setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
    }
  };

  // Focus node info text for screen reader
  const focusedNode = nodesRef.current.find(n => n.id === focusedNodeId);

  return (
    <div className="space-y-6 pb-12 animate-fade-in-up">
      {/* Hidden Live Region for Screen Readers */}
      <div id={ariaAnnouncementId} className="sr-only" aria-live="polite">
        {focusedNode
          ? `Selected 3D Node: ${focusedNode.label}. Type: ${focusedNode.type}. ${focusedNode.subLabel || ''}`
          : '3D Knowledge Graph visualizer active.'}
      </div>

      {/* Header Bar */}
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

        {/* Filter Controls and Node Legend */}
        <div className="pt-2 border-t border-slate-200 dark:border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-xs relative z-10">
          <div className="flex flex-wrap items-center gap-3 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2 py-0.5 rounded-md transition-colors ${
                filterType === 'all' ? 'bg-indigo-500/20 text-indigo-400 font-bold border border-indigo-500/40' : 'hover:text-zinc-200'
              }`}
            >
              All ({nodesRef.current.length})
            </button>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 shadow-sm animate-pulse" /> Meeting
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-sm" /> Commitment
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-purple-400 shadow-sm" /> Owner
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400 shadow-sm" /> Jira
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-sm" /> GitHub
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search input */}
            <div className="relative">
              <SearchIcon size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search graph..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1 rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 text-xs text-slate-800 dark:text-zinc-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-36 sm:w-48 font-sans"
              />
            </div>

            {/* Assignee Filter */}
            <select
              value={filterOwner}
              onChange={e => setFilterOwner(e.target.value)}
              className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-indigo-500 font-sans"
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

      {/* 3D Visualizer Canvas Container */}
      {viewMode === '3d' ? (
        <div
          ref={containerRef}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          aria-label="Interactive 3D Knowledge Graph visualizer. Use arrow keys to cycle nodes, Enter to select, R to reset view, S to toggle auto-spin."
          className="relative rounded-3xl bg-slate-950 border border-indigo-500/30 overflow-hidden shadow-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/80"
        >
          {/* Preset Camera Views & Controls Overlay */}
          <div className="absolute top-4 right-4 z-10 flex flex-wrap items-center gap-2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-zinc-800 shadow-lg text-xs">
            <button
              onClick={() => setIsAutoRotate(!isAutoRotate)}
              className={`px-3 py-1.5 rounded-xl font-mono text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                isAutoRotate
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
              title="Toggle automatic orbital spin [Hotkey: S]"
            >
              <RefreshCwIcon size={12} className={isAutoRotate ? 'animate-spin' : ''} />
              <span>{isAutoRotate ? 'Auto-Spin ON' : 'Auto-Spin OFF'}</span>
            </button>

            <button
              onClick={() => {
                rotationRef.current.targetX = 0.35;
                rotationRef.current.targetY = 0.5;
                setZoomLevel(1.0);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-[11px] font-semibold"
              title="Default Isometric Camera View [Hotkey: R]"
            >
              Isometric
            </button>

            <button
              onClick={() => {
                rotationRef.current.targetX = 1.45;
                rotationRef.current.targetY = 0;
                setZoomLevel(1.1);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-[11px] font-semibold"
              title="Top-Down Orbital View"
            >
              Top-Down
            </button>

            <button
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 2.0))}
              className="px-2.5 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 font-bold"
              title="Zoom In [Hotkey: +]"
            >
              +
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.5))}
              className="px-2.5 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 font-bold"
              title="Zoom Out [Hotkey: -]"
            >
              -
            </button>
          </div>

          {/* Interactive Keyboard & Accessibility Instructions */}
          <div className="absolute top-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-zinc-800 shadow-lg text-[11px] font-mono text-zinc-300 space-y-1 max-w-xs">
            <div className="flex items-center justify-between gap-2 font-bold text-cyan-400">
              <span className="flex items-center gap-1.5">
                <SparklesIcon size={13} />
                3D Graph Controls
              </span>
              <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[9px] text-zinc-400 border border-zinc-700">Keyboard Ready</span>
            </div>
            <p className="text-zinc-400 text-[10px] leading-relaxed">
              • <strong>Mouse</strong>: Click & drag to rotate 3D graph.<br />
              • <strong>Keyboard</strong>: Use <kbd className="px-1 bg-zinc-800 rounded border border-zinc-700 text-zinc-300">Tab</kbd> / <kbd className="px-1 bg-zinc-800 rounded border border-zinc-700 text-zinc-300">← →</kbd> to cycle nodes, <kbd className="px-1 bg-zinc-800 rounded border border-zinc-700 text-zinc-300">Enter</kbd> to inspect.<br />
              • <strong>Shortcuts</strong>: <kbd className="px-1 bg-zinc-800 rounded border border-zinc-700 text-zinc-300">R</kbd> (Reset), <kbd className="px-1 bg-zinc-800 rounded border border-zinc-700 text-zinc-300">S</kbd> (Spin).
            </p>
          </div>

          {/* Dynamic Interactive Node Hover Tooltip */}
          {hoveredNode && (
            <div
              style={{
                left: `${Math.min(hoveredNode.x + 15, (containerRef.current?.clientWidth || 800) - 220)}px`,
                top: `${Math.max(15, hoveredNode.y - 45)}px`
              }}
              className="absolute z-20 pointer-events-none bg-slate-900/95 border border-cyan-500/50 p-3 rounded-xl shadow-2xl backdrop-blur-xl text-xs space-y-1 max-w-[200px] animate-fade-in"
            >
              <div className="font-bold text-cyan-300 truncate">{hoveredNode.node.label}</div>
              <div className="text-[10px] text-zinc-400 font-mono flex items-center justify-between">
                <span>Type: {hoveredNode.node.type.toUpperCase()}</span>
                <span className="text-emerald-400">Click to Trace</span>
              </div>
              {hoveredNode.node.subLabel && (
                <div className="text-[10px] text-zinc-300 leading-tight pt-0.5 border-t border-zinc-800">
                  {hoveredNode.node.subLabel}
                </div>
              )}
            </div>
          )}

          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={handleCanvasClick}
            className="w-full h-[540px] block cursor-grab active:cursor-grabbing"
          />
        </div>
      ) : (
        /* Linear Matrix View */
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
              <span>4. Target Date</span>
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
                  onClick={() => {
                    setSelectedTaskId(item.id);
                    setFocusedNodeId(`node-com-${item.id}`);
                  }}
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

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
  SearchIcon,
  MaximizeIcon,
  MinimizeIcon
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

interface AmbientParticle {
  x: number;
  y: number;
  z: number;
  size: number;
  opacity: number;
  speedY: number;
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
  const [isFullscreen, setIsFullscreen] = useState(false);

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
  const ambientParticlesRef = useRef<AmbientParticle[]>([]);
  const animFrameIdRef = useRef<number | null>(null);
  const ariaAnnouncementId = useId();

  const selectedItem = actionItems.find(a => a.id === selectedTaskId) || actionItems[0];
  const originMeeting = meetings.find(m => m.id === selectedItem?.meeting_id);
  const ownersList = Array.from(new Set(actionItems.map(a => a.owner_name).filter(Boolean)));

  // Native Fullscreen Toggle API (Triggers true F11 whole-screen mode)
  const toggleFullscreenMode = async () => {
    try {
      const isNative = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
      if (!isNative) {
        const el = containerRef.current;
        if (el?.requestFullscreen) {
          await el.requestFullscreen();
        } else if ((el as any)?.webkitRequestFullscreen) {
          await (el as any).webkitRequestFullscreen();
        } else if ((el as any)?.msRequestFullscreen) {
          await (el as any).msRequestFullscreen();
        } else {
          setIsFullscreen(prev => !prev);
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Native fullscreen request blocked, using expanded viewport mode:', err);
      setIsFullscreen(prev => !prev);
    }
  };

  // Global hotkey listener for R (reset), S (spin), F/F11 (fullscreen), +/- (zoom)
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNativeFull = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
      setIsFullscreen(isNativeFull);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.matches('input, select, textarea')) return;

      if (e.key === 'Escape' && isFullscreen) {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        } else {
          setIsFullscreen(false);
        }
      } else if (e.key === 'f' || e.key === 'F' || e.key === 'F11') {
        e.preventDefault();
        toggleFullscreenMode();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        rotationRef.current.targetX = 0.35;
        rotationRef.current.targetY = 0.5;
        rotationRef.current.velX = 0;
        rotationRef.current.velY = 0;
        setZoomLevel(1.0);
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        setIsAutoRotate(prev => !prev);
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setZoomLevel(prev => Math.min(prev + 0.25, 2.4));
      } else if (e.key === '-') {
        e.preventDefault();
        setZoomLevel(prev => Math.max(prev - 0.25, 0.4));
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [isFullscreen]);

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

  // Initialize Ambient Floating Background Particles
  useEffect(() => {
    const ambient: AmbientParticle[] = [];
    for (let i = 0; i < 50; i++) {
      ambient.push({
        x: (Math.random() - 0.5) * 1600,
        y: (Math.random() - 0.5) * 1000,
        z: (Math.random() - 0.5) * 1600,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2,
        speedY: (Math.random() - 0.5) * 0.3
      });
    }
    ambientParticlesRef.current = ambient;
  }, []);

  // Initialize 3D Graph Nodes with Enhanced Spatial Separation & Elevation Staggering
  useEffect(() => {
    const nodes: GraphNode3D[] = [];
    const particles: Particle3D[] = [];

    // Wide Orbit Separation to prevent radial overlapping
    const rMeeting = isFullscreen ? 320 : 220;
    const rCom = isFullscreen ? 560 : 380;
    const rOwner = isFullscreen ? 820 : 540;
    const rJira = isFullscreen ? 1040 : 700;

    // Central Core AI Nucleus
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
        radius: 26,
        connections: []
      });
    }

    // Meeting Nodes in Inner Orbit (Dispersed vertically)
    const activeMeetings = meetings.slice(0, 6);
    const meetingCount = Math.max(1, activeMeetings.length);

    if (filterType === 'all' || filterType === 'meeting') {
      activeMeetings.forEach((m, idx) => {
        const angle = (idx / meetingCount) * Math.PI * 2 + 0.2;
        const mNodeId = `node-meeting-${m.id}`;
        // Vertical Y altitude staggering between -60 and +60
        const yElev = (idx % 2 === 0 ? 55 : -55) + Math.sin(idx) * 20;

        nodes.push({
          id: mNodeId,
          label: m.title.length > 22 ? m.title.slice(0, 22) + '...' : m.title,
          subLabel: `Ingested ${new Date(m.meeting_date).toLocaleDateString()}`,
          type: 'meeting',
          x: Math.cos(angle) * rMeeting,
          y: yElev,
          z: Math.sin(angle) * rMeeting,
          color: '#818cf8',
          radius: 18,
          connections: nodes.some(n => n.id === coreId) ? [coreId] : [],
          payload: m
        });
        if (nodes[0] && nodes[0].id === coreId) {
          nodes[0].connections.push(mNodeId);
        }
      });
    }

    // Commitment, Owner, and Jira/GitHub Nodes with Full 360° Azimuth & Altitude Dispersion
    const displayItems = filteredItems.slice(0, 12);
    const itemTotal = Math.max(1, displayItems.length);

    displayItems.forEach((item, idx) => {
      // Angular spacing around 360°
      const baseAngle = (idx / itemTotal) * Math.PI * 2;
      const cNodeId = `node-com-${item.id}`;
      const mNodeId = `node-meeting-${item.meeting_id}`;

      // Commitment Node (Altitude staggered between -130 and +130)
      if (filterType === 'all' || filterType === 'commitment') {
        const comY = (idx % 4 - 1.5) * 75; // -112.5, -37.5, +37.5, +112.5
        nodes.push({
          id: cNodeId,
          label: item.title.length > 24 ? item.title.slice(0, 24) + '...' : item.title,
          subLabel: `${Math.round(item.confidence * 100)}% Conf • ${item.status.toUpperCase()}`,
          type: 'commitment',
          x: Math.cos(baseAngle) * rCom,
          y: comY,
          z: Math.sin(baseAngle) * rCom,
          color: item.status === 'done' ? '#10b981' : item.status === 'overdue' ? '#f43f5e' : '#06b6d4',
          radius: 16,
          connections: nodes.some(n => n.id === mNodeId) ? [mNodeId] : (nodes.some(n => n.id === coreId) ? [coreId] : []),
          payload: item
        });
      }

      // Owner Node (Angularly offset by +0.35 rad, Altitude staggered opposite)
      if (filterType === 'all' || filterType === 'owner') {
        const oNodeId = `node-owner-${item.owner_name?.toLowerCase().replace(/\s+/g, '-')}`;
        let ownerNode = nodes.find(n => n.id === oNodeId);
        if (!ownerNode) {
          const ownerAngle = baseAngle + 0.35;
          const ownerY = ((idx + 2) % 4 - 1.5) * 65;
          ownerNode = {
            id: oNodeId,
            label: item.owner_name || 'Assignee',
            subLabel: 'Responsible Lead',
            type: 'owner',
            x: Math.cos(ownerAngle) * rOwner,
            y: ownerY,
            z: Math.sin(ownerAngle) * rOwner,
            color: '#c084fc',
            radius: 17,
            connections: []
          };
          nodes.push(ownerNode);
        }
        if (nodes.some(n => n.id === cNodeId)) {
          ownerNode.connections.push(cNodeId);
        }
      }

      // Jira / GitHub Execution Node (Angularly offset by +0.70 rad, Altitude offset)
      if ((filterType === 'all' || filterType === 'jira' || filterType === 'github') && (item.jira_issue_key || item.id)) {
        const jNodeId = `node-jira-${item.id}`;
        const jiraAngle = baseAngle + 0.70;
        const jiraY = ((idx + 1) % 4 - 1.5) * 85;
        nodes.push({
          id: jNodeId,
          label: item.jira_issue_key || `LOOP-${101 + idx}`,
          subLabel: item.status === 'done' ? 'GitHub PR Verified' : 'Jira Ticket Synced',
          type: item.status === 'done' ? 'github' : 'jira',
          x: Math.cos(jiraAngle) * rJira,
          y: jiraY,
          z: Math.sin(jiraAngle) * rJira,
          color: item.status === 'done' ? '#34d399' : '#f59e0b',
          radius: 14,
          connections: nodes.some(n => n.id === cNodeId) ? [cNodeId] : [],
          payload: item
        });
      }

      // Add animated pulse particle along beam connection
      if (nodes.some(n => n.id === cNodeId)) {
        particles.push({
          fromNodeId: nodes.some(n => n.id === mNodeId) ? mNodeId : coreId,
          toNodeId: cNodeId,
          progress: Math.random(),
          speed: 0.003 + Math.random() * 0.006,
          color: item.status === 'done' ? '#10b981' : '#06b6d4'
        });
      }
    });

    nodesRef.current = nodes;
    particlesRef.current = particles;
    if (nodes.length > 0 && !focusedNodeId) {
      setFocusedNodeId(nodes[0].id);
    }
  }, [actionItems, meetings, filterOwner, filterType, searchQuery, isFullscreen]);

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
      const targetHeight = isFullscreen ? Math.max(500, window.innerHeight - (document.fullscreenElement ? 90 : 170)) : 640;

      canvas.width = rect.width * dpr;
      canvas.height = targetHeight * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${targetHeight}px`;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      if (!ctx || !canvas || !canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      const cssWidth = rect.width;
      const cssHeight = isFullscreen ? Math.max(500, window.innerHeight - (document.fullscreenElement ? 90 : 170)) : 640;

      // Smooth Physics & Rotation Lerp
      const rot = rotationRef.current;
      if (isAutoRotate && !isDraggingRef.current) {
        rot.targetY += 0.0022;
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

      // Cyber ambient radial background & grid glow
      const cx = cssWidth / 2;
      const cy = cssHeight / 2;

      const grad = ctx.createRadialGradient(cx, cy, 80, cx, cy, Math.max(cssWidth, cssHeight) / 0.85);
      grad.addColorStop(0, 'rgba(99, 102, 241, 0.18)');
      grad.addColorStop(0.4, 'rgba(6, 182, 212, 0.08)');
      grad.addColorStop(1, 'rgba(5, 7, 15, 0.97)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, cssWidth, cssHeight);

      // 3D Rotation matrices
      const cosX = Math.cos(rot.currentX), sinX = Math.sin(rot.currentX);
      const cosY = Math.cos(rot.currentY), sinY = Math.sin(rot.currentY);
      const cameraZ = isFullscreen ? 760 : 560;
      const fov = (isFullscreen ? 600 : 480) * zoomLevel;

      // Draw 3D Orbital Grid Floor Rings
      const orbitalRings = isFullscreen ? [320, 560, 820, 1040] : [220, 380, 540, 700];
      orbitalRings.forEach((r, idx) => {
        ctx.beginPath();
        const segments = 64;
        for (let i = 0; i <= segments; i++) {
          const a = (i / segments) * Math.PI * 2;
          const rx = Math.cos(a) * r;
          const rz = Math.sin(a) * r;
          const ry = 0;

          let x1 = rx * cosY - rz * sinY;
          let z1 = rx * sinY + rz * cosY;
          let y1 = ry * cosX - z1 * sinX;
          let z2 = ry * sinX + z1 * cosX;

          const scale = fov / Math.max(120, z2 + cameraZ);
          const sx = cx + x1 * scale;
          const sy = cy + y1 * scale;

          if (i === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        const colors = ['rgba(99, 102, 241, 0.16)', 'rgba(6, 182, 212, 0.14)', 'rgba(192, 132, 252, 0.12)', 'rgba(245, 158, 11, 0.10)'];
        ctx.strokeStyle = colors[idx % colors.length];
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Draw Floating Ambient Cyber Starfield Particles
      ambientParticlesRef.current.forEach(p => {
        p.y += p.speedY;
        if (p.y > 500) p.y = -500;
        if (p.y < -500) p.y = 500;

        let x1 = p.x * cosY - p.z * sinY;
        let z1 = p.x * sinY + p.z * cosY;
        let y1 = p.y * cosX - z1 * sinX;
        let z2 = p.y * sinX + z1 * cosX;

        const scale = fov / Math.max(120, z2 + cameraZ);
        const sx = cx + x1 * scale;
        const sy = cy + y1 * scale;

        ctx.beginPath();
        ctx.arc(sx, sy, p.size * scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(165, 180, 252, ${p.opacity * scale})`;
        ctx.fill();
      });

      // Projected Nodes list with depth sorting
      const projectedNodes = nodesRef.current.map(n => {
        let x1 = n.x * cosY - n.z * sinY;
        let z1 = n.x * sinY + n.z * cosY;
        let y1 = n.y * cosX - z1 * sinX;
        let z2 = n.y * sinX + z1 * cosX;

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
            const midY = (p.screenY + targetP.screenY) / 2 - 28 * p.scale;
            ctx.quadraticCurveTo(midX, midY, targetP.screenX, targetP.screenY);

            if (isHighlightedPath) {
              ctx.strokeStyle = '#06b6d4';
              ctx.lineWidth = 3.6;
              ctx.shadowColor = '#06b6d4';
              ctx.shadowBlur = 20;
            } else {
              ctx.strokeStyle = 'rgba(99, 102, 241, 0.38)';
              ctx.lineWidth = Math.max(1.0, 1.6 * p.scale);
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
          ctx.arc(px, py, Math.max(2.5, 4.4 * fromP.scale), 0, Math.PI * 2);
          ctx.fillStyle = pt.color;
          ctx.shadowColor = pt.color;
          ctx.shadowBlur = 14;
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
        const rad = Math.max(6, node.radius * scale * (isSelected || isFocused || isHovered ? 1.35 : 1));

        // Node Glow Aura
        if (isSelected || isFocused || isHovered || node.type === 'core') {
          ctx.beginPath();
          ctx.arc(screenX, screenY, rad * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = node.color + '45';
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
          ctx.shadowBlur = 26;
          ctx.fill();
          ctx.strokeStyle = '#a5b4fc';
          ctx.lineWidth = 3.0;
          ctx.stroke();
        } else if (node.type === 'meeting') {
          // Meeting Node: Rounded Glass Capsule
          const w = rad * 2.3;
          const h = rad * 1.5;
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
          ctx.shadowBlur = isSelected ? 20 : 10;
          ctx.fill();
          ctx.strokeStyle = '#c7d2fe';
          ctx.lineWidth = 1.8;
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
          ctx.shadowBlur = 14;
          ctx.fill();
          ctx.strokeStyle = '#f0abfc';
          ctx.lineWidth = 1.8;
          ctx.stroke();
        } else if (node.type === 'jira' || node.type === 'github') {
          // Integration Node: Diamond
          ctx.moveTo(screenX, screenY - rad * 1.3);
          ctx.lineTo(screenX + rad * 1.3, screenY);
          ctx.lineTo(screenX, screenY + rad * 1.3);
          ctx.lineTo(screenX - rad * 1.3, screenY);
          ctx.closePath();
          ctx.fillStyle = node.color;
          ctx.shadowColor = node.color;
          ctx.shadowBlur = 16;
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.8;
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
          ctx.shadowBlur = isSelected ? 22 : 12;
          ctx.fill();
          ctx.strokeStyle = isSelected || isFocused ? '#ffffff' : node.color;
          ctx.lineWidth = isSelected ? 3.0 : 1.5;
          ctx.stroke();
        }

        ctx.shadowBlur = 0;

        // Label Text Badge
        if (scale > 0.38) {
          const fontSize = Math.max(10, Math.min(14, Math.round(12 * scale)));
          ctx.font = `bold ${fontSize}px JetBrains Mono, monospace`;
          const textWidth = ctx.measureText(node.label).width;
          const paddingX = 9 * scale;
          const paddingY = 4 * scale;
          const badgeY = screenY + rad + 10 * scale;

          ctx.fillStyle = isSelected || isFocused ? 'rgba(79, 70, 229, 0.94)' : 'rgba(15, 23, 42, 0.90)';
          ctx.strokeStyle = isSelected || isFocused ? '#c7d2fe' : 'rgba(255, 255, 255, 0.24)';
          ctx.lineWidth = 1;

          if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(screenX - textWidth / 2 - paddingX, badgeY, textWidth + paddingX * 2, fontSize + paddingY * 2, 7);
            ctx.fill();
            ctx.stroke();
          } else {
            ctx.fillRect(screenX - textWidth / 2 - paddingX, badgeY, textWidth + paddingX * 2, fontSize + paddingY * 2);
          }

          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.fillText(node.label, screenX, badgeY + fontSize);

          if (node.subLabel && scale > 0.62 && (isSelected || isFocused || isHovered)) {
            ctx.font = `${Math.max(9, Math.round(10 * scale))}px sans-serif`;
            ctx.fillStyle = '#cbd5e1';
            ctx.fillText(node.subLabel, screenX, badgeY + fontSize + 16 * scale);
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
  }, [viewMode, selectedTaskId, focusedNodeId, isAutoRotate, zoomLevel, hoveredNode, isFullscreen]);

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
      const cssHeight = isFullscreen ? Math.max(500, window.innerHeight - (document.fullscreenElement ? 90 : 170)) : 640;
      const cx = cssWidth / 2;
      const cy = cssHeight / 2;
      const rot = rotationRef.current;
      const cosX = Math.cos(rot.currentX), sinX = Math.sin(rot.currentX);
      const cosY = Math.cos(rot.currentY), sinY = Math.sin(rot.currentY);
      const cameraZ = isFullscreen ? 760 : 560;
      const fov = (isFullscreen ? 600 : 480) * zoomLevel;

      let found: GraphNode3D | null = null;
      let foundX = 0, foundY = 0;

      for (const n of nodesRef.current) {
        let x1 = n.x * cosY - n.z * sinY;
        let z1 = n.x * sinY + n.z * cosY;
        let y1 = n.y * cosX - z1 * sinX;
        let z2 = n.y * sinX + z1 * cosX;
        const scale = fov / Math.max(120, z2 + cameraZ);
        const screenX = cx + x1 * scale;
        const screenY = cy + y1 * scale;

        const dist = Math.hypot(mouseX - screenX, mouseY - screenY);
        if (dist <= n.radius * scale * 1.7) {
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

  // Mouse Wheel Zoom & Touch Pinch-to-Zoom Handlers for 3D Holodeck Graph
  const touchDistanceRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomDelta = e.deltaY < 0 ? 0.15 : -0.15;
      setZoomLevel(prev => Math.min(Math.max(prev + zoomDelta, 0.3), 3.5));
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchDistanceRef.current = Math.hypot(dx, dy);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && touchDistanceRef.current !== null) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const newDist = Math.hypot(dx, dy);
        const diff = (newDist - touchDistanceRef.current) * 0.006;
        setZoomLevel(prev => Math.min(Math.max(prev + diff, 0.3), 3.5));
        touchDistanceRef.current = newDist;
      }
    };

    const handleTouchEnd = () => {
      touchDistanceRef.current = null;
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

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

            {viewMode === '3d' && (
              <button
                onClick={toggleFullscreenMode}
                className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                title="Toggle Native Browser Fullscreen (F11 / F)"
              >
                {isFullscreen ? <MinimizeIcon size={13} /> : <MaximizeIcon size={13} />}
                <span className="hidden sm:inline">{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen (F11)'}</span>
              </button>
            )}
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
          aria-label="Interactive 3D Knowledge Graph visualizer. Use R to reset view, S to toggle auto-spin."
          className={`relative overflow-hidden shadow-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/80 ${
            isFullscreen
              ? 'fixed inset-0 z-[9999] w-screen h-screen bg-[#05070f] flex flex-col border-0 rounded-none'
              : 'rounded-3xl bg-slate-950 border border-indigo-500/30'
          }`}
        >
          {/* Fullscreen Overlay Header Bar (Zero overlapping) */}
          {isFullscreen && (
            <div className="w-full z-30 flex items-center justify-between bg-slate-900/90 backdrop-blur-2xl px-6 py-3.5 border-b border-indigo-500/30 shadow-2xl shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="h-10 w-10 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <NetworkIcon size={22} className="text-cyan-400 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-white tracking-wider font-mono">
                    LOOPKEEPER HOLODECK • 3D KNOWLEDGE GRAPH
                  </h2>
                  <p className="text-xs text-slate-400 font-mono flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Real-Time Vector Lineage</span>
                    <span>•</span>
                    <span>{nodesRef.current.length} Active Nodes</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={toggleFullscreenMode}
                  className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-mono text-xs font-bold flex items-center gap-2 transition-all shadow-lg hover:scale-105 active:scale-95"
                >
                  <MinimizeIcon size={14} />
                  <span>Exit Fullscreen (ESC)</span>
                </button>
              </div>
            </div>
          )}

          {/* Controls Overlay (Positioned top-20 in fullscreen to avoid overlapping top bar) */}
          <div className={`absolute ${isFullscreen ? 'top-20' : 'top-4'} right-4 z-20 flex flex-wrap items-center gap-2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-zinc-800 shadow-lg text-xs`}>
            <button
              onClick={toggleFullscreenMode}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-mono text-[11px] font-bold flex items-center gap-1.5 shadow-md hover:scale-105 transition-all"
              title="Toggle Fullscreen Holodeck [Hotkey: F11 / F]"
            >
              {isFullscreen ? <MinimizeIcon size={13} /> : <MaximizeIcon size={13} />}
              <span>{isFullscreen ? 'Normal View' : 'Full Screen (F11)'}</span>
            </button>

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
                rotationRef.current.velX = 0;
                rotationRef.current.velY = 0;
                setZoomLevel(1.0);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-[11px] font-semibold"
              title="Default Isometric Camera View [Hotkey: R]"
            >
              Isometric (R)
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
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 2.4))}
              className="px-2.5 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 font-bold"
              title="Zoom In [Hotkey: +]"
            >
              +
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.4))}
              className="px-2.5 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 font-bold"
              title="Zoom Out [Hotkey: -]"
            >
              -
            </button>
          </div>

          {/* Interactive Keyboard Instructions (Positioned top-20 in fullscreen to avoid overlapping top bar) */}
          <div className={`absolute ${isFullscreen ? 'top-20' : 'top-4'} left-4 z-20 bg-slate-900/90 backdrop-blur-md p-3.5 rounded-2xl border border-zinc-800 shadow-lg text-[11px] font-mono text-zinc-300 space-y-1.5 max-w-xs`}>
            <div className="flex items-center justify-between gap-2 font-bold text-cyan-400">
              <span className="flex items-center gap-1.5">
                <SparklesIcon size={13} />
                3D Graph Controls
              </span>
              <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[9px] text-zinc-400 border border-zinc-700">Hotkeys Active</span>
            </div>
            <p className="text-zinc-400 text-[10px] leading-relaxed">
              • <strong>Mouse</strong>: Click & drag to rotate 3D graph. Scroll wheel or pinch to Zoom In / Out.<br />
              • <strong>Shortcuts</strong>: <kbd className="px-1 bg-zinc-800 rounded border border-zinc-700 text-zinc-300">R</kbd> (Reset Camera), <kbd className="px-1 bg-zinc-800 rounded border border-zinc-700 text-zinc-300">S</kbd> (Auto-Spin), <kbd className="px-1 bg-zinc-800 rounded border border-zinc-700 text-zinc-300">+</kbd> / <kbd className="px-1 bg-zinc-800 rounded border border-zinc-700 text-zinc-300">-</kbd> (Zoom), <kbd className="px-1 bg-zinc-800 rounded border border-zinc-700 text-zinc-300">F11</kbd> / <kbd className="px-1 bg-zinc-800 rounded border border-zinc-700 text-zinc-300">F</kbd> (Fullscreen).
            </p>
          </div>

          {/* Dynamic Interactive Node Hover Tooltip */}
          {hoveredNode && (
            <div
              style={{
                left: `${Math.min(hoveredNode.x + 15, (containerRef.current?.clientWidth || 800) - 240)}px`,
                top: `${Math.max(15, hoveredNode.y - 45)}px`
              }}
              className="absolute z-30 pointer-events-none bg-slate-900/95 border border-cyan-500/50 p-3.5 rounded-2xl shadow-2xl backdrop-blur-xl text-xs space-y-1 max-w-[220px] animate-fade-in"
            >
              <div className="font-bold text-cyan-300 truncate">{hoveredNode.node.label}</div>
              <div className="text-[10px] text-zinc-400 font-mono flex items-center justify-between">
                <span>Type: {hoveredNode.node.type.toUpperCase()}</span>
                <span className="text-emerald-400 font-bold">Click to Trace</span>
              </div>
              {hoveredNode.node.subLabel && (
                <div className="text-[10px] text-zinc-300 leading-tight pt-1 border-t border-zinc-800 font-sans">
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
            className={`w-full block cursor-grab active:cursor-grabbing ${
              isFullscreen ? 'flex-1 h-full' : 'h-[640px]'
            }`}
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

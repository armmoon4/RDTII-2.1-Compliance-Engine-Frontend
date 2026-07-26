import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, ShieldCheck, HelpCircle, Activity, ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';
import { ThinkingOrb, OrbState } from 'thinking-orbs';
import { PipelineEvent } from '../types';

interface LiveLogProps {
  events: PipelineEvent[];
  currentActivity?: string;
  isStreaming?: boolean;
  activeOrbState?: OrbState | 'auto';
  isCollapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
  completedIndicators?: number;
  totalIndicators?: number;
}

export default function LiveLogTerminal({ 
  events, 
  currentActivity, 
  isStreaming,
  activeOrbState = 'auto',
  isCollapsed,
  onToggleCollapse,
  completedIndicators,
  totalIndicators
}: LiveLogProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [internalCollapsed, setInternalCollapsed] = useState<boolean>(!isStreaming);

  // Auto-expand when streaming starts
  useEffect(() => {
    if (isStreaming) {
      if (onToggleCollapse) onToggleCollapse(false);
      else setInternalCollapsed(false);
    }
  }, [isStreaming, onToggleCollapse]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [events]);

  const collapsed = isCollapsed !== undefined ? isCollapsed : internalCollapsed;

  const toggleCollapse = () => {
    const next = !collapsed;
    if (onToggleCollapse) {
      onToggleCollapse(next);
    } else {
      setInternalCollapsed(next);
    }
  };

  // Compute 0-100% live progress
  const getProgress = (): { pct: number; label: string } => {
    if (totalIndicators && totalIndicators > 0 && completedIndicators !== undefined && completedIndicators > 0) {
      const pct = Math.min(Math.round((completedIndicators / totalIndicators) * 100), 100);
      return { pct, label: `${completedIndicators}/${totalIndicators} (${pct}%)` };
    }

    if (currentActivity) {
      const match = currentActivity.match(/\((\d+)\/(\d+)\)/);
      if (match) {
        const cur = parseInt(match[1], 10);
        const tot = parseInt(match[2], 10);
        if (tot > 0) {
          const pct = Math.min(Math.round((cur / tot) * 100), 100);
          return { pct, label: `${cur}/${tot} (${pct}%)` };
        }
      }
    }

    const act = (currentActivity || '').toLowerCase();
    const eventCount = events.length;

    // Milestone-based progress
    if (act.includes('initializ') || act.includes('chunking')) {
      return { pct: 50, label: '50%' };
    }
    if (act.includes('discover') || act.includes('crawl') || act.includes('tavily') || act.includes('search')) {
      const pct = Math.min(45, Math.max(10, 10 + eventCount * 3));
      return { pct, label: `${pct}%` };
    }
    if (act.includes('prosecut')) {
      return { pct: 65, label: '65%' };
    }
    if (act.includes('defens')) {
      return { pct: 80, label: '80%' };
    }
    if (act.includes('arbit') || act.includes('debat') || act.includes('solv')) {
      return { pct: 92, label: '92%' };
    }
    if (act.includes('compos') || act.includes('export') || act.includes('complet')) {
      return { pct: 100, label: '100%' };
    }

    if (isStreaming) {
      const pct = Math.min(90, Math.max(20, 20 + eventCount * 2));
      return { pct, label: `${pct}%` };
    }

    return { pct: 0, label: '0%' };
  };

  const progress = getProgress();

  // Derive Orb State matching actual pipeline activity
  const getOrbState = (): OrbState => {
    if (activeOrbState && activeOrbState !== 'auto') {
      return activeOrbState;
    }

    // When not streaming / completed, orb resets to idle listening state
    if (!isStreaming) {
      return 'listening';
    }

    const act = (currentActivity || '').toLowerCase();

    // 1. Primary check on active status message
    if (act.includes('initializ') || act.includes('analyz') || act.includes('llm') || act.includes('prosecut') || act.includes('defens') || act.includes('arbit') || act.includes('debat') || act.includes('solv')) {
      return 'solving';
    }
    if (act.includes('discover') || act.includes('crawl') || act.includes('tavily') || act.includes('playwright') || act.includes('search') || act.includes('fetch')) {
      return 'searching';
    }
    if (act.includes('chunk') || act.includes('shape') || act.includes('format') || act.includes('structur')) {
      return 'shaping';
    }
    if (act.includes('compos') || act.includes('report') || act.includes('matrix') || act.includes('export')) {
      return 'composing';
    }

    // 2. Secondary check on most recent event log
    const lastEvent = events.length > 0 ? events[events.length - 1] : null;
    if (lastEvent) {
      const agent = (lastEvent.agent || '').toLowerCase();
      const msg = (lastEvent.message || '').toLowerCase();

      if (agent === 'prosecution' || agent === 'defense' || agent === 'arbiter' || msg.includes('prosecut') || msg.includes('defens') || msg.includes('arbit')) {
        return 'solving';
      }
      if (agent === 'discovery' || msg.includes('crawl') || msg.includes('search')) {
        return 'searching';
      }
    }

    if (isStreaming) return 'working';
    return 'listening';
  };

  const orbState = getOrbState();

  const isFinished = !isStreaming || progress.pct === 100;
  const displayStateLabel = isFinished ? 'complete' : orbState;

  const getDisplayActivity = (): string => {
    if (isFinished) {
      const completionEvent = [...events].reverse().find(e => 
        (e.message || '').toLowerCase().includes('pipeline complete') || 
        (e.message || '').toLowerCase().includes('analysis complete')
      );
      if (completionEvent) {
        return completionEvent.message;
      }
      if (currentActivity && (currentActivity.toLowerCase().includes('complet') || currentActivity.toLowerCase().includes('finish'))) {
        return currentActivity;
      }
      return 'Pipeline complete — All indicators scored';
    }
    return currentActivity || 'Pipeline active...';
  };

  const displayActivity = getDisplayActivity();

  const getAgentColor = (agent: string) => {
    switch (agent) {
      case 'discovery': return 'text-sky-400 dark:text-sky-300';
      case 'prosecution': return 'text-indigo-400 dark:text-indigo-300';
      case 'defense': return 'text-emerald-400 dark:text-emerald-300';
      case 'arbiter': return 'text-amber-500 dark:text-amber-400';
      default: return 'text-slate-400';
    }
  };

  const getEventIcon = (type: string) => {
    if (type.includes('ERROR')) return '❌';
    if (type.includes('SUCCESS') || type.includes('ZONE1')) return '⭐';
    if (type.includes('ARBITER')) return '⚖️';
    if (type.includes('DEFENSE')) return '🛡️';
    if (type.includes('PROSECUTION')) return '⚖️';
    return '⚡';
  };

  // FULL VIEW CONSOLE
  return (
    <div className="bg-slate-950 text-slate-300 rounded-xl border border-slate-800 p-4 font-mono text-xs shadow-lg relative overflow-hidden transition-all duration-300" id="live-log-terminal">
      {/* Top Console Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center gap-2.5">
          <ThinkingOrb state={orbState} size={20} theme="dark" />
          <Terminal className="w-3.5 h-3.5 text-blue-400" />
          <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
            isFinished
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
              : 'bg-blue-500/10 border border-blue-500/30 text-blue-400'
          }`}>
            State: {displayStateLabel}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {isStreaming && (
            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">
                Streaming {progress.pct}%
              </span>
            </div>
          )}
          <span className="text-[10px] text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded sm:inline-block">
            SYS: DUCKP_v2.1
          </span>
        </div>
      </div>

      {/* Hero Agent Activity & 0-100% Progress Card */}
      {(currentActivity || isFinished) && (
        <div className="mb-3 p-3 bg-slate-900/90 border border-slate-800 rounded-xl text-slate-200 shadow-inner space-y-2">
          <div className="flex items-center justify-between gap-4 text-[11px] font-semibold">
            <div className="flex items-center gap-3 min-w-0">
              <div className="shrink-0 flex items-center justify-center p-1 bg-slate-950 rounded-lg border border-slate-800">
                <ThinkingOrb state={orbState} size={64} theme="dark" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] uppercase tracking-wider font-bold ${
                    isFinished ? 'text-emerald-400' : 'text-blue-400'
                  }`}>
                    Agent State: {displayStateLabel}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-400/10 px-1.5 py-0.5 rounded border border-emerald-400/20">
                    {progress.pct}% COMPLETE
                  </span>
                </div>
                <div className="text-slate-100 font-bold truncate text-xs mt-0.5">
                  {displayActivity}
                </div>
              </div>
            </div>
            <div className="shrink-0 hidden md:block text-right">
              <span className="text-[10px] text-slate-500 font-mono block uppercase">PROGRESS</span>
              <span className="text-[11px] text-emerald-400 font-mono font-bold">{progress.label}</span>
            </div>
          </div>

          {/* 0 to 100% Progress Bar */}
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>0%</span>
              <span className="text-amber-400 font-bold">Progress: {progress.pct}%</span>
              <span>100%</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800/80 p-0.5">
              <div 
                className="bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${progress.pct}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Terminal Window */}
      <div 
        ref={terminalRef}
        className="h-[210px] overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800 pr-1.5"
        id="terminal-lines"
      >
        <AnimatePresence initial={false}>
          {events.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-3 py-6">
              <div className="p-3 bg-slate-900/60 rounded-full border border-slate-800">
                <ThinkingOrb state={orbState} size={64} theme="dark" />
              </div>
              <div className="text-center">
                <span className="block text-slate-300 font-medium text-xs">No logs recorded for this view.</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Launch a compliance run above or select a run from the database.
                </span>
              </div>
            </div>
          ) : (
            events.map((ev, index) => (
              <motion.div
                key={ev.id || index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-start gap-2.5 leading-relaxed py-0.5 hover:bg-slate-900/40 rounded transition-colors"
                id={`log-line-${index}`}
              >
                <span className="text-slate-600 select-none text-[10px]">
                  {ev.created_at ? ev.created_at.slice(11, 19) : new Date().toLocaleTimeString()}
                </span>
                <span className="select-none text-[11px]">
                  {getEventIcon(ev.event_type)}
                </span>
                <span className={`font-semibold shrink-0 uppercase text-[11px] ${getAgentColor(ev.agent)}`}>
                  [{ev.agent}]
                </span>
                {ev.indicator_id && (
                  <span className="text-amber-400 font-bold bg-amber-400/10 px-1.5 py-0.5 rounded text-[10px] scale-95 uppercase shrink-0">
                    Ind {ev.indicator_id}
                  </span>
                )}
                <span className="text-slate-200 text-[11.5px] break-words flex-1">
                  {ev.message}
                </span>
                {ev.data && (
                  <button
                    onClick={() => {
                      alert(JSON.stringify(JSON.parse(ev.data || '{}'), null, 2));
                    }}
                    className="text-[10px] text-slate-500 hover:text-slate-300 font-semibold underline bg-slate-900 border border-slate-800 scale-90 px-1.5 rounded transition-transform shrink-0 cursor-pointer"
                    title="View payload"
                  >
                    Payload
                  </button>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Bar */}
      <div className="mt-3 pt-3 border-t border-slate-850 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            PostgreSQL: OK
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            Redis Store: OK
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Workers Online
          </span>
        </div>
        <span>{events.length} system logs loaded</span>
      </div>
    </div>
  );
}

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, ShieldCheck, HelpCircle, Activity } from 'lucide-react';
import { PipelineEvent } from '../types';

interface LiveLogProps {
  events: PipelineEvent[];
  currentActivity?: string;
  isStreaming?: boolean;
}

export default function LiveLogTerminal({ events, currentActivity, isStreaming }: LiveLogProps) {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [events]);

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

  return (
    <div className="bg-slate-950 text-slate-300 rounded-xl border border-slate-800 p-4 font-mono text-xs shadow-lg relative overflow-hidden" id="live-log-terminal">
      {/* Top Console Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-amber-500 animate-pulse" />
          <span className="font-semibold text-slate-200 tracking-wide text-[11px] uppercase">
            Live
          </span>
        </div>
        <div className="flex items-center gap-3">
          {isStreaming && (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">
                Streaming
              </span>
            </div>
          )}
          <span className="text-[10px] text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
            SYS: DUCKP_v2.1
          </span>
        </div>
      </div>

      {currentActivity && (
        <div className="mb-3 px-3 py-2 bg-slate-900/50 border border-slate-800/40 rounded-lg text-slate-200 flex items-center gap-2 text-[11px] font-semibold animate-pulse-slow">
          <Activity className="w-3.5 h-3.5 text-amber-500" />
          <span>Status: {currentActivity}</span>
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
            <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2">
              <HelpCircle className="w-8 h-8 text-slate-700" />
              <span>No logs recorded. Select a run or launch a new compliance analysis.</span>
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
                    className="text-[10px] text-slate-500 hover:text-slate-300 font-semibold underline bg-slate-900 border border-slate-800 scale-90 px-1.5 rounded transition-transform shrink-0"
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

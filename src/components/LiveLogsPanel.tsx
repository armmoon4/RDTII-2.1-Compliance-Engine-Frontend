import { useState, useEffect } from 'react';
import { getRuns, getRunEvents } from '../api';
import { AnalysisRun, PipelineEvent } from '../types';
import { Terminal, Info, AlertTriangle, Loader2 } from 'lucide-react';

interface AugmentedEvent extends PipelineEvent {
  _country: string;
}

const LOG_ICONS: Record<string, string> = {
  SEARCH: '🔍', CLASSIFY: '🏷️', DOWNLOAD: '⬇️', ZONE1: '✅',
  CHUNK: '📄', EMBED: '🧠', PROSECUTION: '⚖️', DEFENSE: '🛡️',
  ARBITER: '⚖️', INDICATOR: '📊', STATUS: 'ℹ️', ERROR: '❌',
};

export default function LiveLogsPanel() {
  const [events, setEvents] = useState<AugmentedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      const [runs, rErr] = await getRuns();
      if (cancelled) return;
      if (rErr) { setError(rErr); setLoading(false); return; }
      const active = (runs || []).filter((r: AnalysisRun) => ['DISCOVERING', 'ANALYSING', 'RUNNING'].includes(r.status));
      if (active.length === 0) {
        setEvents([]);
        setLoading(false);
        return;
      }
      const all: AugmentedEvent[] = [];
      for (const run of active) {
        const [data, dErr] = await getRunEvents(run.id, 30);
        if (dErr || !data?.events) continue;
        for (const ev of data.events) {
          all.push({ ...ev, _country: run.country });
        }
      }
      all.sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''));
      if (!cancelled) { setEvents(all); setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <section>
      <div className="section-head">
        <div>
          <div className="section-title flex items-center gap-2">
            <Terminal className="w-4 h-4" style={{ color: 'var(--green)' }} />
            Live Logs
          </div>
          <div className="section-sub">Real-time activity from all active analysis runs</div>
        </div>
      </div>

      {loading ? (
        <div className="loading-overlay">
          <Loader2 className="w-5 h-5 spinner" />
          <span>Loading logs...</span>
        </div>
      ) : error ? (
        <div className="error-box">
          <AlertTriangle className="w-4 h-4" />
          <div>{error}</div>
        </div>
      ) : events.length === 0 ? (
        <div className="info-box">
          <Info className="w-4 h-4" />
          <div>No active runs. Start an analysis to see live logs.</div>
        </div>
      ) : (
        <div className="log-box" style={{ maxHeight: '60vh' }}>
          {events.map((ev, i) => {
            const tag = (ev.event_type || '').replace(/_DONE$/, '').replace(/_START$/, '');
            const icon = LOG_ICONS[tag] || '•';
            return (
              <div className="ll" key={ev.id || i}>
                <span className="ll-ts">{(ev.created_at || '').slice(11, 19)}</span>
                <span className="ll-icon">{icon}</span>
                <span className="ll-agent" style={{ color: 'var(--amber)' }}>{ev._country}</span>
                <span className="ll-agent">{ev.agent || ''}</span>
                <span className="ll-ind">{ev.indicator_id || ''}</span>
                <span className="ll-msg">{(ev.message || '').slice(0, 100)}</span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

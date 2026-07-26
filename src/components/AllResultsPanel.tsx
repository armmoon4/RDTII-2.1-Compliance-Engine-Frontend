import { useState, useEffect, useCallback } from 'react';
import { getAllResults } from '../api';
import { IndicatorResult } from '../types';
import { List, ChevronLeft, ChevronRight, Info, AlertTriangle, Loader2 } from 'lucide-react';

const PAGE_SIZE = 50;

export default function AllResultsPanel() {
  const [results, setResults] = useState<IndicatorResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);

  const fetchPage = useCallback(async (newOffset: number) => {
    setLoading(true);
    setError(null);
    const [data, err] = await getAllResults(PAGE_SIZE, newOffset);
    if (err) {
      setError(err);
      setResults([]);
    } else if (!data || data.length === 0) {
      setResults([]);
      if (newOffset > 0) setOffset(Math.max(0, newOffset - PAGE_SIZE));
    } else {
      setResults(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchPage(0); }, [fetchPage]);

  const prevPage = () => {
    const newOff = Math.max(0, offset - PAGE_SIZE);
    setOffset(newOff);
    fetchPage(newOff);
  };

  const nextPage = () => {
    const newOff = offset + PAGE_SIZE;
    setOffset(newOff);
    fetchPage(newOff);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="section-title flex items-center gap-2">
            <List className="w-4 h-4" style={{ color: 'var(--blue)' }} />
            All Results
          </div>
          <div className="section-sub">Paginated indicator results across all completed runs</div>
        </div>
      </div>

      <div className="stat-card" style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: '10px 16px', display: results.length > 0 ? 'flex' : 'none' }}>
        <button className="btn btn-ghost btn-sm" onClick={prevPage} disabled={offset === 0}>
          <ChevronLeft className="w-3.5 h-3.5" /> Previous
        </button>
        <span style={{ fontSize: 12, color: 'var(--text-3)', flex: 1, textAlign: 'center' }}>
          {offset + 1}–{offset + results.length}
        </span>
        <button className="btn btn-ghost btn-sm" onClick={nextPage}>
          Next <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {loading ? (
        <div className="loading-overlay">
          <Loader2 className="w-5 h-5 spinner" />
          <span>Loading results...</span>
        </div>
      ) : error ? (
        <div className="error-box">
          <AlertTriangle className="w-4 h-4" />
          <div>{error}</div>
        </div>
      ) : results.length === 0 ? (
        <div className="info-box">
          <Info className="w-4 h-4" />
          <div>{offset === 0 ? 'No results in the database yet.' : 'No more results.'}</div>
        </div>
      ) : (
        <div className="tbl-wrap shadow-xs border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--surface)]">
          <table className="dt w-full text-left border-collapse font-sans text-xs">
            <thead>
              <tr className="bg-[var(--surface2)] border-b border-[var(--border)] text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)]">
                <th className="py-3 px-3">ID</th>
                <th className="py-3 px-3">Economy</th>
                <th className="py-3 px-3">Law Name & Citation</th>
                <th className="py-3 px-3">Indicator Code</th>
                <th className="py-3 px-3">Coverage</th>
                <th className="py-3 px-3">Discovery Tag</th>
                <th className="py-3 px-3">Verbatim Snippet</th>
                <th className="py-3 px-3 text-center">Score</th>
                <th className="py-3 px-3 text-right">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {results.map(r => {
                const parts = (r.indicator_id || '').split('.');
                const suffix = parts.length > 1 ? parts.slice(1).join('.') : parts[0];
                const rdtiiId = `P${r.pillar_id || 'X'}-I${suffix}`;
                const citation = (r.article_citation || '');

                const scoreVal = r.raw_score !== null ? r.raw_score.toFixed(1) : null;
                const scoreBadge = scoreVal === '1.0'
                  ? 'bg-rose-500/15 border-rose-500/30 text-rose-500 dark:text-rose-400'
                  : scoreVal === '0.5'
                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-500 dark:text-amber-400'
                    : scoreVal === '0.0'
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-500 dark:text-emerald-400'
                      : 'bg-slate-500/15 border-slate-500/30 text-slate-400';

                const tagColor = r.discovery_tag === 'KNOWN' ? 'pill-blue' : r.discovery_tag === 'NEW' ? 'pill-green' : 'pill-purple';

                return (
                  <tr key={r.id} className="hover:bg-[var(--surface2)]/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-[var(--accent)] font-bold">{r.id ?? '—'}</td>
                    <td className="py-2.5 px-3 font-semibold text-[var(--text)]">{r.country || 'Global'}</td>
                    <td className="py-2.5 px-3 max-w-xs">
                      <div className="font-semibold text-[var(--text-2)] truncate">{(r.act_and_practice || '—')}</div>
                      {citation && <div className="text-[10px] text-amber-500 font-mono">Ref: {citation}</div>}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="font-mono text-xs font-bold text-[var(--accent)]">{r.indicator_id}</span>
                      <span className="text-[9px] font-semibold text-[var(--text-3)] bg-[var(--surface2)] border border-[var(--border)] px-1 py-0.5 rounded ml-1.5">{rdtiiId}</span>
                    </td>
                    <td className="py-2.5 px-3 text-[var(--text-3)]">{r.coverage || 'Horizontal'}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`pill ${tagColor} text-[10px] font-bold uppercase`}>{r.discovery_tag || 'KNOWN'}</span>
                    </td>
                    <td className="py-2.5 px-3 max-w-xs italic text-[11px] text-[var(--text-3)] truncate font-sans">
                      {r.verbatim_quote && r.verbatim_quote !== '—' ? `"${r.verbatim_quote}"` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border inline-block ${scoreBadge}`}>
                        {r.raw_score !== null ? r.raw_score.toFixed(1) : 'Silent'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      {r.confidence != null ? (
                        <div className="flex items-center justify-end gap-1.5 font-mono font-bold text-xs">
                          <div className="w-10 bg-[var(--surface2)] border border-[var(--border)] h-1.5 rounded-full overflow-hidden shrink-0">
                            <div className="bg-sky-400 h-full rounded-full" style={{ width: `${(r.confidence * 100).toFixed(0)}%` }} />
                          </div>
                          <span>{(r.confidence * 100).toFixed(0)}%</span>
                        </div>
                      ) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

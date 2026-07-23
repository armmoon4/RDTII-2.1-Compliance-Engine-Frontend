import { useState, useEffect, useCallback } from 'react';
import { getRuns, getRunDetail } from '../api';
import { AnalysisRun, IndicatorResult } from '../types';
import { List, Info, AlertTriangle, Loader2, Eye } from 'lucide-react';

interface AugmentedResult {
  runCountry: string;
  id: number;
  run_id: string;
  pillar_id: number;
  indicator_id: string;
  raw_score: number | null;
  act_and_practice: string;
  coverage: string;
  impact_comments: string;
  timeframe: string;
  references: string;
  note: string;
  confidence: number;
  verbatim_quote: string;
  article_citation: string;
  not_found: boolean;
  prosecution_score?: number | null;
  defense_score?: number | null;
  arbiter_score?: number | null;
  discovery_tag: string;
  source_pdf_path?: string | null;
  location_ref?: string | null;
  processing_time: number;
  mapping_rationale: string;
  country?: string;
}

export default function IndicatorsPanel({ onAudit }: { onAudit?: (result: IndicatorResult) => void }) {
  const [rows, setRows] = useState<AugmentedResult[]>([]);
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
      const completed = (runs || []).filter((r: AnalysisRun) => r.status === 'COMPLETE');
      if (completed.length === 0) {
        setRows([]);
        setLoading(false);
        return;
      }
      const all: AugmentedResult[] = [];
      for (const run of completed) {
        const [det, dErr] = await getRunDetail(run.id);
        if (dErr || !det) continue;
        for (const r of (det.indicator_results || [])) {
          all.push({ ...r, runCountry: run.country });
        }
      }
      if (!cancelled) {
        setRows(all);
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div>
      <div className="section-head">
        <div>
          <div className="section-title flex items-center gap-2">
            <List className="w-4 h-4" style={{ color: 'var(--blue)' }} />
            All Indicators
          </div>
          <div className="section-sub">Aggregated indicator results across all completed runs</div>
        </div>
      </div>

      {loading ? (
        <div className="loading-overlay">
          <Loader2 className="w-5 h-5 spinner" />
          <span>Loading indicators...</span>
        </div>
      ) : error ? (
        <div className="error-box">
          <AlertTriangle className="w-4 h-4" />
          <div>{error}</div>
        </div>
      ) : rows.length === 0 ? (
        <div className="info-box">
          <Info className="w-4 h-4" />
          <div>No completed runs yet.</div>
        </div>
      ) : (
        <div className="tbl-wrap">
          <table className="dt" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>
            <thead>
              <tr>
                <th>ID</th><th>Country</th><th>Indicator</th><th>Law</th><th>Confidence</th><th>Score</th><th>Tag</th><th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => {
                const parts = (r.indicator_id || '').split('.');
                const suffix = parts.length > 1 ? parts.slice(1).join('.') : parts[0];
                const rdtiiId = `P${r.pillar_id}-I${suffix}`;
                const scoreColor = r.confidence >= 0.7 ? 'pill-green' : r.confidence >= 0.4 ? 'pill-amber' : 'pill-red';
                return (
                  <tr key={r.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontWeight: 500 }}>{r.id ?? '—'}</td>
                    <td>{r.runCountry}</td>
                    <td>{rdtiiId}</td>
                    <td>{(r.act_and_practice || '—').slice(0, 40)}</td>
                    <td>{r.confidence != null ? (r.confidence * 100).toFixed(0) + '%' : ''}</td>
                    <td><span className={`pill ${scoreColor}`}>{r.raw_score ?? '—'}</span></td>
                    <td>{r.discovery_tag || 'NEW'}</td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => onAudit?.(r)} title="Audit">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ fontSize: 11, color: 'var(--text-3)', padding: '8px 12px' }}>
            {rows.length} results loaded
          </div>
        </div>
      )}
    </div>
  );
}

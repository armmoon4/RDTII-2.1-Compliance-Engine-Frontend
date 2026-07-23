import { useState, useEffect } from 'react';
import { getRuns, EXPORT_BASE } from '../api';
import { AnalysisRun } from '../types';
import { Download, Info, AlertTriangle, Loader2, FileJson, FileSpreadsheet, Table } from 'lucide-react';

export default function ExportsPanel() {
  const [completed, setCompleted] = useState<AnalysisRun[]>([]);
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
      setCompleted((runs || []).filter((r: AnalysisRun) => r.status === 'COMPLETE'));
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const downloadExport = (format: string) => {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = `${EXPORT_BASE}/api/v1/analysis/export/all?format=${format}`;
    document.body.appendChild(iframe);
    setTimeout(() => iframe.remove(), 60000);
  };

  return (
    <section>
      <div className="section-head">
        <div>
          <div className="section-title flex items-center gap-2">
            <Download className="w-4 h-4" style={{ color: 'var(--purple)' }} />
            Exports
          </div>
          <div className="section-sub">Download indicator results from completed runs</div>
        </div>
      </div>

      {loading ? (
        <div className="loading-overlay">
          <Loader2 className="w-5 h-5 spinner" />
          <span>Loading exports...</span>
        </div>
      ) : error ? (
        <div className="error-box">
          <AlertTriangle className="w-4 h-4" />
          <div>{error}</div>
        </div>
      ) : completed.length === 0 ? (
        <div className="info-box">
          <Info className="w-4 h-4" />
          <div>No completed runs to export.</div>
        </div>
      ) : (
        <>
          <div className="card" style={{ padding: '14px 18px', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <strong>Export All Results</strong><br />
                <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Download aggregated results across all runs</span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => downloadExport('csv')}>
                  <FileSpreadsheet className="w-3.5 h-3.5" /> CSV
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => downloadExport('json')}>
                  <FileJson className="w-3.5 h-3.5" /> JSON
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => downloadExport('excel')}>
                  <Table className="w-3.5 h-3.5" /> Excel
                </button>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 12, fontSize: 12, color: 'var(--text-3)' }}>
            {completed.length} completed runs available for export
          </div>

          {completed.map(r => (
            <div key={r.id} className="card" style={{ padding: '14px 18px', marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{r.country}</strong> · <code style={{ fontSize: 11, color: 'var(--text-3)' }}>{(r.id || '').slice(0, 8)}...</code> · {r.completed_indicators || 0} indicators
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <a className="export-link" href={`${EXPORT_BASE}/api/v1/analysis/${r.id}/export?format=json`} target="_blank" rel="noreferrer">
                    <FileJson className="w-3 h-3" /> JSON
                  </a>
                  <a className="export-link" href={`${EXPORT_BASE}/api/v1/analysis/${r.id}/export?format=csv`} target="_blank" rel="noreferrer">
                    <FileSpreadsheet className="w-3 h-3" /> CSV
                  </a>
                  <a className="export-link" href={`${EXPORT_BASE}/api/v1/analysis/${r.id}/export?format=rdtii_flat_csv`} target="_blank" rel="noreferrer">
                    <FileSpreadsheet className="w-3 h-3" /> CSV (Flat)
                  </a>
                  <a className="export-link" href={`${EXPORT_BASE}/api/v1/analysis/${r.id}/export?format=excel`} target="_blank" rel="noreferrer">
                    <Table className="w-3 h-3" /> Excel
                  </a>
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </section>
  );
}

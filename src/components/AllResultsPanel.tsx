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
        <div className="tbl-wrap">
          <table className="dt" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>
            <thead>
              <tr>
                <th>ID</th><th>Economy</th><th>Law Name</th><th>Law Number / Ref</th><th>Coverage</th>
                <th>Indicator ID</th><th>Article / Section</th><th>Discovery Tag</th>
                <th>Verbatim Snippet</th><th>Source URL</th><th>Score</th><th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {results.map(r => {
                const parts = (r.indicator_id || '').split('.');
                const suffix = parts.length > 1 ? parts.slice(1).join('.') : parts[0];
                const rdtiiId = `P${r.pillar_id || ''}-I${suffix}`;
                const citation = (r.article_citation || '');
                const lawRef = citation ? citation.split(',')[0].trim() : '';
                const confidence = r.confidence != null ? (r.confidence * 100).toFixed(0) + '%' : '';
                return (
                  <tr key={r.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontWeight: 500 }}>{r.id ?? '—'}</td>
                    <td>{r.country || ''}</td>
                    <td>{(r.act_and_practice || '—').slice(0, 50)}</td>
                    <td>{lawRef || '—'}</td>
                    <td>{r.coverage || 'N/A'}</td>
                    <td>{rdtiiId}</td>
                    <td>{citation || '—'}</td>
                    <td><span className={`pill ${r.discovery_tag === 'KNOWN' ? 'pill-blue' : 'pill-amber'}`}>{r.discovery_tag || 'NEW'}</span></td>
                    <td>{(r.verbatim_quote || '—').slice(0, 80)}</td>
                    <td style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 10 }}>{(r.references || '—').slice(0, 50)}</td>
                    <td>{r.raw_score != null ? r.raw_score.toFixed(2) : ''}</td>
                    <td>{confidence}</td>
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

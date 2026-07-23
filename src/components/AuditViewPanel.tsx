import { useState } from 'react';
import { getAuditResult } from '../api';
import { AuditResponse } from '../api';
import { Eye, AlertTriangle, Loader2, Search } from 'lucide-react';

export default function AuditViewPanel() {
  const [inputId, setInputId] = useState('');
  const [data, setData] = useState<AuditResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAudit = async () => {
    const id = parseInt(inputId, 10);
    if (!id) return;
    setLoading(true);
    setError(null);
    setData(null);
    const [result, err] = await getAuditResult(id);
    if (err) {
      setError(err || 'Not found');
    } else if (result) {
      setData(result);
    }
    setLoading(false);
  };

  const rs = data?.raw_score;
  const scorePill = rs != null ? (rs >= 0.7 ? 'pill-green' : rs >= 0.4 ? 'pill-amber' : 'pill-red') : 'pill-gray';
  const docsHtml = (data?.source_documents || []).map(d => (
    `<div class="ll"><span class="ll-ts">${escH(d.source_type)}</span><span class="ll-msg">${escH(d.url)}</span><span class="ll-ind">cer=${d.ocr_quality_cer ?? 0}</span></div>`
  )).join('') || '<div style="color:var(--text-3);font-size:12px;">No source documents</div>';

  return (
    <section>
      <div className="section-head">
        <div>
          <div className="section-title flex items-center gap-2">
            <Eye className="w-4 h-4" style={{ color: 'var(--blue)' }} />
            Audit View
          </div>
          <div className="section-sub">Inspect a single indicator result against source documents</div>
        </div>
      </div>

      <div className="card">
        <div className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <label style={{ whiteSpace: 'nowrap' }}>Indicator Result ID</label>
          <input
            type="number" min={1} placeholder="e.g. 1"
            value={inputId}
            onChange={e => setInputId(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') loadAudit(); }}
            style={{ background: 'var(--bg)', border: '1px solid var(--border-med)', borderRadius: 7, padding: '7px 10px', fontSize: 13, color: 'var(--text)', width: 160, fontFamily: 'inherit', outline: 'none' }}
          />
          <button className="btn btn-primary" onClick={loadAudit} disabled={loading}>
            <Search className="w-3.5 h-3.5" /> Audit
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading-overlay" style={{ padding: 20 }}>
          <Loader2 className="w-5 h-5 spinner" />
          <span>Loading audit...</span>
        </div>
      )}

      {error && (
        <div className="error-box" style={{ marginTop: 16 }}>
          <AlertTriangle className="w-4 h-4" />
          <div>Audit error: {error}</div>
        </div>
      )}

      {data && !loading && (
        <div className="card" style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 16 }}>
            <span><strong>Result ID:</strong> {data.result_id}</span>
            <span><strong>Indicator:</strong> {escH(data.indicator_id)}</span>
            <span><strong>Country:</strong> {escH(data.country)}</span>
            <span><span className={`pill ${scorePill}`}>{rs ?? '—'}</span></span>
          </div>
          <div className="detail-row"><span className="detail-label">Act / Practice</span><span>{escH(data.act_and_practice || '—')}</span></div>
          <div className="detail-row"><span className="detail-label">Citation</span><span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{escH(data.article_citation || '—')}</span></div>
          <div className="detail-row"><span className="detail-label">Verbatim Quote</span><span style={{ background: 'var(--surface2)', padding: 10, borderRadius: 6, fontStyle: 'italic' }}>{escH(data.verbatim_quote || '—')}</span></div>
          <div className="detail-row"><span className="detail-label">References</span><span style={{ fontSize: 12, wordBreak: 'break-all' }}>{escH(data.references || '—')}</span></div>
          <div className="detail-row"><span className="detail-label">Mapping Rationale</span><span>{escH(data.mapping_rationale || '—')}</span></div>
          <div className="detail-row"><span className="detail-label">Impact Comments</span><span>{escH(data.impact_comments || '—')}</span></div>
          <div className="detail-row"><span className="detail-label">Source Documents</span></div>
          <div style={{ background: 'var(--log-bg)', border: '1px solid var(--border)', borderRadius: 8, padding: 8, fontSize: 12 }} dangerouslySetInnerHTML={{ __html: docsHtml }} />
        </div>
      )}
    </section>
  );
}

function escH(s: unknown): string {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

import { useState, useEffect } from 'react';
import { getCountries } from '../api';
import { Globe, Info, AlertTriangle, Loader2 } from 'lucide-react';

export default function CountriesPanel() {
  const [countries, setCountries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      const [data, err] = await getCountries();
      if (cancelled) return;
      if (err) { setError(err); } else { setCountries(data || []); }
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <section>
      <div className="section-head">
        <div>
          <div className="section-title flex items-center gap-2">
            <Globe className="w-4 h-4" style={{ color: 'var(--green)' }} />
            Analysed Countries
          </div>
          <div className="section-sub">Countries that have been submitted for RDTII analysis</div>
        </div>
      </div>

      {loading ? (
        <div className="loading-overlay">
          <Loader2 className="w-5 h-5 spinner" />
          <span>Loading countries...</span>
        </div>
      ) : error ? (
        <div className="error-box">
          <AlertTriangle className="w-4 h-4" />
          <div>{error}</div>
        </div>
      ) : countries.length === 0 ? (
        <div className="info-box">
          <Info className="w-4 h-4" />
          <div>No countries have been analysed yet.</div>
        </div>
      ) : (
        <>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 10 }}>
            <strong>{countries.length}</strong> countries analysed
          </div>
          {countries.map(c => (
            <div key={c} className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <Globe className="w-5 h-5" style={{ color: 'var(--blue)' }} />
              <span style={{ fontSize: 14, fontWeight: 600 }}>{c}</span>
            </div>
          ))}
        </>
      )}
    </section>
  );
}

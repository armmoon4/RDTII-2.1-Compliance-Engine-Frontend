import { useState, useEffect } from 'react';
import { getTokenUsage } from '../api';
import { TokenUsage } from '../api';
import { Coins, Info, AlertTriangle, Loader2, ArrowUp, ArrowDown, Flame, DollarSign } from 'lucide-react';

const TOKEN_PRICING: Record<string, { input_per_1m: number; output_per_1m: number; color: string; label: string }> = {
  openai:   { input_per_1m: 0.15,  output_per_1m: 0.60,  color: '#19c37d',  label: 'OpenAI (GPT-4o-mini)' },
  gemini:   { input_per_1m: 0.15,  output_per_1m: 0.60,  color: '#4285f4',  label: 'Gemini (2.5 Flash)' },
  deepseek: { input_per_1m: 0.27,  output_per_1m: 1.10,  color: '#4f6b8a',  label: 'DeepSeek (deepseek-chat)' },
  grok:     { input_per_1m: 2.00,  output_per_1m: 10.00, color: '#1c1c1c',  label: 'Grok (grok-2)' },
  minimax:  { input_per_1m: 0,     output_per_1m: 0,     color: '#ff6b6b',  label: 'MiniMax-M3 (Free)' },
  nvidia:   { input_per_1m: 0,     output_per_1m: 0,     color: '#76b900',  label: 'Nvidia Nemotron (Free)' },
  ollama:   { input_per_1m: 0,     output_per_1m: 0,     color: '#f5a623',  label: 'Ollama (Local)' },
};

function estCost(prov: string, inp: number, out: number) {
  const info = TOKEN_PRICING[prov];
  if (!info || (info.input_per_1m === 0 && info.output_per_1m === 0)) return 0;
  return (inp / 1_000_000) * info.input_per_1m + (out / 1_000_000) * info.output_per_1m;
}

export default function TokenBurnPanel() {
  const [tab, setTab] = useState<'actual' | 'calc'>('actual');
  const [data, setData] = useState<TokenUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculator state
  const [calcProv, setCalcProv] = useState('openai');
  const [calcInput, setCalcInput] = useState('');
  const [calcOutput, setCalcOutput] = useState('');
  const [calls, setCalls] = useState(5);
  const [indicators, setIndicators] = useState(61);
  const [avgIn, setAvgIn] = useState(8000);
  const [avgOut, setAvgOut] = useState(2000);

  useEffect(() => {
    if (tab !== 'actual') return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      const [d, err] = await getTokenUsage(50);
      if (cancelled) return;
      if (err) { setError(err); } else { setData(d || []); }
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [tab]);

  const info = TOKEN_PRICING[calcProv];
  const inTok = Math.floor(calcInput.length / 4);
  const outTok = Math.floor(calcOutput.length / 4);
  const cost = estCost(calcProv, inTok, outTok);
  const isFree = info?.input_per_1m === 0 && info?.output_per_1m === 0;

  const totalCalls = calls * indicators;
  const totalIn = totalCalls * avgIn;
  const totalOut = totalCalls * avgOut;
  const totalCost = estCost(calcProv, totalIn, totalOut);

  const totalInput = data.reduce((s, t) => s + (t.total_input_tokens || 0), 0);
  const totalOutput = data.reduce((s, t) => s + (t.total_output_tokens || 0), 0);
  const totalCostUsd = data.reduce((s, t) => s + (t.estimated_cost_usd || 0), 0);

  return (
    <section>
      <div className="section-head">
        <div>
          <div className="section-title flex items-center gap-2">
            <Coins className="w-4 h-4" style={{ color: 'var(--amber)' }} />
            Token Burn — Per Analysis
          </div>
          <div className="section-sub">Token usage and cost estimates across LLM providers</div>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 16 }}>
        <div className={`tab ${tab === 'actual' ? 'active' : ''}`} onClick={() => setTab('actual')}>Actual Token Usage</div>
        <div className={`tab ${tab === 'calc' ? 'active' : ''}`} onClick={() => setTab('calc')}>Token Calculator</div>
      </div>

      {tab === 'actual' && (
        <>
          {loading ? (
            <div className="loading-overlay">
              <Loader2 className="w-5 h-5 spinner" />
              <span>Loading token usage...</span>
            </div>
          ) : error ? (
            <div className="error-box">
              <AlertTriangle className="w-4 h-4" />
              <div>{error}</div>
            </div>
          ) : data.length === 0 ? (
            <div className="info-box">
              <Info className="w-4 h-4" />
              <div>No analysis runs yet. Submit an analysis to see token burn data.</div>
            </div>
          ) : (
            <>
              <div className="tbl-wrap">
                <table className="dt">
                  <thead>
                    <tr>
                      <th style={{ width: 50, textAlign: 'center' }}>#</th><th>Country</th><th>Status</th><th>Provider</th>
                      <th>Input Tokens</th><th>Output Tokens</th><th>Total Tokens</th>
                      <th>Est. Cost</th><th>Indicators</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((t, i) => (
                      <tr key={i}>
                        <td style={{ textAlign: 'center' }}>
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[var(--surface2)] text-[var(--accent)] border border-[var(--border)]">
                            #{data.length - i}
                          </span>
                        </td>
                        <td>{t.country}</td>
                        <td><span className={`pill ${t.status === 'COMPLETE' ? 'pill-green' : 'pill-amber'}`}>{t.status}</span></td>
                        <td>{t.llm_provider || 'auto'}</td>
                        <td>{Number(t.total_input_tokens || 0).toLocaleString()}</td>
                        <td>{Number(t.total_output_tokens || 0).toLocaleString()}</td>
                        <td>{Number(t.total_tokens || 0).toLocaleString()}</td>
                        <td>{t.estimated_cost_usd > 0 ? '$' + Number(t.estimated_cost_usd).toFixed(6) : 'FREE'}</td>
                        <td>{t.indicators_analysed || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="stats-grid" style={{ marginTop: 14, gridTemplateColumns: 'repeat(4,1fr)' }}>
                <div className="stat-card">
                  <div className="stat-icon-row">
                    <div className="stat-icon" style={{ background: 'var(--blue-bg)', color: 'var(--blue)' }}><ArrowUp className="w-4 h-4" /></div>
                  </div>
                  <div><div className="stat-label">Total Input Tokens</div><div className="stat-value">{totalInput.toLocaleString()}</div></div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon-row">
                    <div className="stat-icon" style={{ background: 'var(--amber-bg)', color: 'var(--amber)' }}><ArrowDown className="w-4 h-4" /></div>
                  </div>
                  <div><div className="stat-label">Total Output Tokens</div><div className="stat-value">{totalOutput.toLocaleString()}</div></div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon-row">
                    <div className="stat-icon" style={{ background: 'var(--purple-bg)', color: 'var(--purple)' }}><Flame className="w-4 h-4" /></div>
                  </div>
                  <div><div className="stat-label">Total Tokens Burned</div><div className="stat-value">{(totalInput + totalOutput).toLocaleString()}</div></div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon-row">
                    <div className="stat-icon" style={{ background: totalCostUsd > 0 ? 'var(--green-bg)' : 'var(--green-bg)', color: totalCostUsd > 0 ? 'var(--green)' : 'var(--green)' }}><DollarSign className="w-4 h-4" /></div>
                  </div>
                  <div><div className="stat-label">Total Cost</div><div className="stat-value">{totalCostUsd > 0 ? '$' + totalCostUsd.toFixed(4) : 'FREE'}</div></div>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {tab === 'calc' && (
        <div className="card">
          <div className="card-title">Estimate token consumption</div>
          <div className="card-desc" style={{ marginBottom: 14 }}>Estimate token consumption before submitting an analysis</div>
          <div className="two-col">
            <div>
              <div className="field">
                <label>Provider</label>
                <select value={calcProv} onChange={e => setCalcProv(e.target.value)}>
                  <option value="openai">OpenAI (GPT-4o-mini)</option>
                  <option value="gemini">Gemini (2.5 Flash)</option>
                  <option value="deepseek">DeepSeek (deepseek-chat)</option>
                  <option value="grok">Grok (grok-2)</option>
                  <option value="minimax">MiniMax-M3 (Free)</option>
                  <option value="nvidia">Nvidia Nemotron (Free)</option>
                  <option value="ollama">Ollama (Local)</option>
                </select>
              </div>
              <div className="field" style={{ marginTop: 12 }}>
                <label>Input / System Prompt</label>
                <textarea value={calcInput} onChange={e => setCalcInput(e.target.value)} rows={4}
                  style={{ background: 'var(--bg)', border: '1px solid var(--border-med)', borderRadius: 7, padding: '8px 10px', fontSize: 13, color: 'var(--text)', fontFamily: 'inherit', outline: 'none', width: '100%', resize: 'vertical' }}
                  placeholder="Paste your prompt..." />
              </div>
              <div className="field" style={{ marginTop: 12 }}>
                <label>Expected Output</label>
                <textarea value={calcOutput} onChange={e => setCalcOutput(e.target.value)} rows={3}
                  style={{ background: 'var(--bg)', border: '1px solid var(--border-med)', borderRadius: 7, padding: '8px 10px', fontSize: 13, color: 'var(--text)', fontFamily: 'inherit', outline: 'none', width: '100%', resize: 'vertical' }}
                  placeholder="Paste expected response..." />
              </div>
            </div>
            <div>
              <div className="card" style={{ padding: '14px 18px', marginBottom: 16 }}>
                <div className="stat-icon-row">
                  <div className="stat-label">Provider</div>
                  <div className="stat-change" style={{ color: info?.color, fontSize: 13, fontWeight: 600 }}>{info?.label}</div>
                </div>
                <hr style={{ margin: '10px 0' }} />
                <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginTop: 8 }}>
                  <div className="stat-card" style={{ padding: 12 }}>
                    <div className="stat-label">Input Tokens</div>
                    <div className="stat-value" style={{ fontSize: 18 }}>{inTok.toLocaleString()}</div>
                  </div>
                  <div className="stat-card" style={{ padding: 12 }}>
                    <div className="stat-label">Output Tokens</div>
                    <div className="stat-value" style={{ fontSize: 18 }}>{outTok.toLocaleString()}</div>
                  </div>
                  <div className="stat-card" style={{ padding: 12 }}>
                    <div className="stat-label">Total</div>
                    <div className="stat-value" style={{ fontSize: 18 }}>{(inTok + outTok).toLocaleString()}</div>
                  </div>
                  <div className="stat-card" style={{ padding: 12 }}>
                    <div className="stat-label">Cost</div>
                    <div className="stat-value" style={{ fontSize: 18, color: isFree ? 'var(--green)' : 'var(--blue)' }}>{isFree ? 'FREE' : '$' + cost.toFixed(8)}</div>
                  </div>
                </div>
              </div>

              <hr style={{ margin: '12px 0' }} />
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Per-Analysis Estimate</div>

              <div className="field" style={{ marginBottom: 8 }}>
                <label>LLM calls per indicator: {calls}</label>
                <input type="range" min={1} max={10} value={calls} onChange={e => setCalls(Number(e.target.value))} style={{ width: '100%' }} />
              </div>
              <div className="field" style={{ marginBottom: 8 }}>
                <label>Number of indicators: {indicators}</label>
                <input type="range" min={1} max={61} value={indicators} onChange={e => setIndicators(Number(e.target.value))} style={{ width: '100%' }} />
              </div>
              <div className="field" style={{ marginBottom: 8 }}>
                <label>Avg input tokens per call: {avgIn.toLocaleString()}</label>
                <input type="range" min={1000} max={100000} step={500} value={avgIn} onChange={e => setAvgIn(Number(e.target.value))} style={{ width: '100%' }} />
              </div>
              <div className="field" style={{ marginBottom: 8 }}>
                <label>Avg output tokens per call: {avgOut.toLocaleString()}</label>
                <input type="range" min={500} max={50000} step={500} value={avgOut} onChange={e => setAvgOut(Number(e.target.value))} style={{ width: '100%' }} />
              </div>

              <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginTop: 12 }}>
                <div className="stat-card" style={{ padding: 12 }}>
                  <div className="stat-label">Total LLM Calls</div>
                  <div className="stat-value" style={{ fontSize: 18 }}>{totalCalls.toLocaleString()}</div>
                </div>
                <div className="stat-card" style={{ padding: 12 }}>
                  <div className="stat-label">Total Input</div>
                  <div className="stat-value" style={{ fontSize: 18, color: 'var(--blue)' }}>{totalIn.toLocaleString()}</div>
                </div>
                <div className="stat-card" style={{ padding: 12 }}>
                  <div className="stat-label">Total Output</div>
                  <div className="stat-value" style={{ fontSize: 18, color: 'var(--amber)' }}>{totalOut.toLocaleString()}</div>
                </div>
                <div className="stat-card" style={{ padding: 12 }}>
                  <div className="stat-label">Est. Cost</div>
                  <div className="stat-value" style={{ fontSize: 18, color: isFree ? 'var(--green)' : 'var(--purple)' }}>{isFree ? 'FREE' : '$' + totalCost.toFixed(4)}</div>
                </div>
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--text-3)', marginTop: 8 }}>~1 token ~ 4 characters (English). Estimate only.</div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

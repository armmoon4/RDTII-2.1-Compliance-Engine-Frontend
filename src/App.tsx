import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bolt, Search, LayoutDashboard, Activity, ListChecks, 
  Shield, Lock, FileText, 
  Moon, Sun, Code, MapPin, ChevronDown, Trash2, 
  Check, X, AlertTriangle, Fingerprint, Eye,
  Sliders, MessageSquareCode, Download,
  List, Coins, Globe, Terminal, FileDown, Search as SearchEye, Flag
} from 'lucide-react';

import { 
  AnalysisRun, IndicatorResult, DiscoveredDocument, PipelineEvent
} from './types';
import { PILLARS_REGISTRY } from './data';
import {
  getApiBase,
  getHealth, getRuns, getRunDetail, getRunEvents,
  submitAnalysis as apiSubmitAnalysis,
  deleteRun as apiDeleteRun,
  getReviewQueue as apiGetReviewQueue,
  HealthResponse, ReviewQueueItem,
} from './api';

import NewAnalysisForm from './components/NewAnalysisForm';
import LiveLogTerminal from './components/LiveLogTerminal';
import AuditModal from './components/AuditModal';
import ReviewQueuePanel from './components/ReviewQueuePanel';
import StatsPanel from './components/StatsPanel';
import AllResultsPanel from './components/AllResultsPanel';
import IndicatorsPanel from './components/IndicatorsPanel';
import TokenBurnPanel from './components/TokenBurnPanel';
import CountriesPanel from './components/CountriesPanel';
import LiveLogsPanel from './components/LiveLogsPanel';
import ExportsPanel from './components/ExportsPanel';
import AuditViewPanel from './components/AuditViewPanel';
import WelcomeScreen from './components/WelcomeScreen';
import { ThinkingOrb } from 'thinking-orbs';

const EXPORT_BASE = getApiBase();

function DashboardLatestRunCard({
  runObj,
  isExpanded,
  onToggleExpand,
  resultsByRun,
  runEvents,
  isThemeDark,
  onDeleteRun,
  onOpenAudit
}: {
  runObj: AnalysisRun;
  isExpanded: boolean;
  onToggleExpand: () => void;
  resultsByRun: Record<string, IndicatorResult[]>;
  runEvents: Record<string, PipelineEvent[]>;
  isThemeDark: boolean;
  onDeleteRun: (id: string) => void;
  onOpenAudit: (result: IndicatorResult) => void;
}) {
  if (!runObj || !runObj.id) return null;

  const runResults = resultsByRun[runObj.id] || [];
  const isRunActive = ['DISCOVERING', 'ANALYSING', 'RUNNING'].includes(runObj.status);
  const completenessPct = runObj.total_indicators > 0 
    ? Math.round((runObj.completed_indicators / runObj.total_indicators) * 100) 
    : 0;

  return (
    <div 
      className={`run-card ${
        isExpanded 
          ? 'open border-[var(--accent)] ring-1 ring-[var(--accent)]/10' 
          : ''
      }`}
    >
      {/* Accordion trigger row */}
      <div 
        onClick={onToggleExpand}
        className="run-header cursor-pointer"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="run-icon text-[var(--accent)]">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h4 className="run-country flex items-center gap-2">
              {runObj.country} Audit
              <span className={`pill ${
                runObj.status === 'COMPLETE' 
                  ? 'pill-green' 
                  : runObj.status === 'FAILED'
                    ? 'pill-red'
                    : 'pill-amber'
              }`}>
                {isRunActive ? (
                  <ThinkingOrb state={runObj.status === 'DISCOVERING' ? 'searching' : 'solving'} size={20} />
                ) : (
                  <span className="status-dot bg-current" />
                )}
                {runObj.status}
              </span>
            </h4>
            <p className="run-id truncate">
              ID: {runObj.id} · Model: {runObj.llm_provider}
            </p>
          </div>
        </div>

        {/* Completeness metrics */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="run-progress-col">
            <div className="prog-bg">
              <div 
                className={`prog-fill ${isRunActive ? 'active' : 'bg-emerald-500'}`}
                style={{ width: `${completenessPct}%` }}
              />
            </div>
            <span className="prog-label">
              {runObj.completed_indicators}/{runObj.total_indicators} pts ({completenessPct}%)
            </span>
          </div>

          <div className="run-time hidden md:block">
            {runObj.created_at ? runObj.created_at.slice(11, 16) : ''} UTC
          </div>

          <ChevronDown className={`chevron w-4 h-4 text-[var(--text-3)] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Detail body */}
      {isExpanded && (
        <div className="run-body">
          <div className="run-detail-grid">
            <div>
              <div className="dl">Territory Domain</div>
              <div className="dv font-semibold">{runObj.country}</div>
            </div>
            <div>
              <div className="dl">Pipeline Status</div>
              <div className="dv text-emerald-500 font-bold uppercase">{runObj.status}</div>
            </div>
            <div>
              <div className="dl">Evaluation Points</div>
              <div className="dv font-mono font-bold text-[var(--accent)]">{runObj.total_indicators} indicators</div>
            </div>
            <div>
              <div className="dl">System Timestamp</div>
              <div className="dv font-mono text-xs">{new Date(runObj.created_at).toLocaleString()}</div>
            </div>
          </div>

          {/* Live Agent Log Console directly inside/under the active run card */}
          <div className="mt-4">
            <LiveLogTerminal 
              events={runEvents[runObj.id] || []}
              currentActivity={runObj.current_activity}
              isStreaming={['DISCOVERING', 'ANALYSING', 'RUNNING'].includes(runObj.status)}
              completedIndicators={runObj.completed_indicators}
              totalIndicators={runObj.total_indicators}
            />
          </div>

          {/* Completed checklist database */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h5 className="text-[11px] font-bold text-[var(--text-3)] uppercase tracking-wider flex items-center gap-1.5">
                <ListChecks className="w-4 h-4 text-[var(--accent)]" />
                Adversarial Arbitration Matrix Results
              </h5>
              
              <div className="export-row mt-0">
                <span className="text-[10px] text-[var(--text-3)] font-mono font-bold leading-none uppercase">Downloads:</span>
                <a 
                  href={`${EXPORT_BASE}/api/v1/analysis/${runObj.id}/export?format=json`}
                  target="_blank"
                  rel="noreferrer"
                  className="export-link"
                >
                  <Download className="w-3 h-3" />
                  JSON
                </a>
                <a 
                  href={`${EXPORT_BASE}/api/v1/analysis/${runObj.id}/export?format=csv`}
                  target="_blank"
                  rel="noreferrer"
                  className="export-link"
                >
                  <Download className="w-3 h-3" />
                  CSV
                </a>
                <a 
                  href={`${EXPORT_BASE}/api/v1/analysis/${runObj.id}/export?format=excel`}
                  target="_blank"
                  rel="noreferrer"
                  className="export-link"
                  style={{ background: 'var(--purple-bg)', borderColor: 'var(--purple-bd)', color: 'var(--purple)' }}
                >
                  <Download className="w-3 h-3" />
                  Excel
                </a>
              </div>
            </div>

            {runResults.length === 0 ? (
              <div className="py-6 text-center text-xs text-[var(--text-3)] italic">
                {['DISCOVERING', 'ANALYSING', 'RUNNING'].includes(runObj.status)
                  ? "Pipeline actively analyzing legal evidence... Structured indicator scores will appear here once arbitration completes."
                  : "No indicator results found for this run."}
              </div>
            ) : (
              <div className="table-wrapper mt-3">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Consensus</th>
                      <th>Source Tag</th>
                      <th>Legislative Enactments & Authority Practice</th>
                      <th>Classification Pilar</th>
                      <th className="text-right">Confidence</th>
                      <th className="text-center">Audit Logs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {runResults.map((result) => {
                      const scoreColor = result.raw_score !== null 
                        ? result.raw_score >= 1.0 
                          ? 'bg-red-500 text-white' 
                          : result.raw_score >= 0.5 
                            ? 'bg-amber-500 text-slate-950' 
                            : 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-500';

                      return (
                        <tr key={result.id}>
                          <td>{result.indicator_id}</td>
                          <td className="py-2.5">
                            <span className={`px-2.5 py-0.5 rounded font-mono text-[10px] font-bold ${scoreColor}`}>
                              {result.raw_score !== null ? result.raw_score.toFixed(1) : 'Silent'}
                            </span>
                          </td>
                          <td>
                            <span className="pill pill-gray text-[10px]">
                              {result.discovery_tag}
                            </span>
                          </td>
                          <td className="font-semibold text-[var(--text-2)] max-w-xs truncate">
                            {result.act_and_practice}
                          </td>
                          <td className="text-[var(--text-3)] text-muted">
                            Pillar {result.pillar_id}
                          </td>
                          <td className="text-right font-mono font-bold text-[var(--text-2)]">
                            {(result.confidence * 100).toFixed(0)}%
                          </td>
                          <td className="text-center">
                            <button 
                              onClick={() => onOpenAudit(result)}
                              className="p-1 px-2.5 text-[var(--accent)] hover:bg-[var(--accent-bg)] bg-transparent border border-transparent rounded transition-all inline-flex items-center gap-1 cursor-pointer font-bold text-xs"
                              title="View audit logs"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Audit</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Infrastructure logs box details */}
          <div className="flex justify-between items-center pt-4 border-t border-[var(--border)] mt-4">
            <span className="text-[10px] text-[var(--text-3)] font-mono font-bold uppercase tracking-wide">
              Arbiter metrics: latency resolved in {runResults.reduce((acc, cr) => acc + cr.processing_time, 0).toFixed(2)}s.
            </span>
            <button 
              onClick={() => onDeleteRun(runObj.id)}
              className="btn btn-danger font-bold text-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Purge Database records
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const API_BASE = getApiBase();
  const EXPORT_BASE = getApiBase();

  // Welcome splash — always show on every load
  const [showWelcome, setShowWelcome] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleEnter = () => {
    setShowWelcome(false);
  };

  // Navigation & Filtering States
  const [activeTab, setActiveTab] = useState<'dashboard' | 'runs' | 'review' | 'docs' | 'results' | 'indicators' | 'token' | 'countries' | 'logs' | 'exports' | 'audit'>('dashboard');
  const [runsFilter, setRunsFilter] = useState<'ALL' | 'COMPLETE' | 'ACTIVE' | 'FAILED' | 'QUEUED'>('ALL');
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [selectedPillarId, setSelectedPillarId] = useState<number | null>(null);

  // App Theme & Live Mode
  const [isThemeDark, setIsThemeDark] = useState<boolean>(() => {
    return localStorage.getItem('rdtii_theme') === 'dark' || 
      (!localStorage.getItem('rdtii_theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Infrastructure state from API
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);

  // Core Data Registers
  const [runs, setRuns] = useState<AnalysisRun[]>([]);
  const [resultsByRun, setResultsByRun] = useState<Record<string, IndicatorResult[]>>({});
  const [documentsByRun, setDocumentsByRun] = useState<Record<string, DiscoveredDocument[]>>({});
  const [runEvents, setRunEvents] = useState<Record<string, PipelineEvent[]>>({});

  // UI Interactive States
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [selectedAuditResult, setSelectedAuditResult] = useState<IndicatorResult | null>(null);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Review queue state
  const [reviewQueue, setReviewQueue] = useState<ReviewQueueItem[]>([]);
  const [isReviewLoading, setIsReviewLoading] = useState(false);

  // Loading states
  const [isLoadingRuns, setIsLoadingRuns] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Thinking Orbs & Dashboard Card State
  const [isDashboardCardExpanded, setIsDashboardCardExpanded] = useState<boolean>(true);

  // Initial Theme Setup
  useEffect(() => {
    const root = window.document.documentElement;
    if (isThemeDark) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      localStorage.setItem('rdtii_theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      localStorage.setItem('rdtii_theme', 'light');
    }
  }, [isThemeDark]);

  // ── Data fetching ──────────────────────────────────────
  const fetchAll = useCallback(async () => {
    // Health
    const [health, hErr] = await getHealth();
    if (health) {
      setHealthData(health);
      setHealthError(null);
    } else if (hErr) {
      setHealthError(hErr);
    }

    // Runs
    const [runsData, rErr] = await getRuns();
    if (runsData) {
      setRuns(runsData);
    }
    setIsLoadingRuns(false);
  }, []);

  // Initial load
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Target active / latest run automatically
  const latestRun = useMemo(() => {
    if (runs.length === 0) return null;
    return [...runs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
  }, [runs]);

  const activeRunId = selectedRunId || latestRun?.id || null;
  const activeRun = runs.find(r => r.id === activeRunId) || latestRun;

  // ── Run detail lazy loading ────────────────────────────
  const loadRunDetail = useCallback(async (runId: string) => {
    const [detail, err] = await getRunDetail(runId);
    if (err || !detail) return;
    if (detail.indicator_results) {
      setResultsByRun(prev => ({ ...prev, [runId]: detail.indicator_results }));
    }
  }, []);

  const loadRunEvents = useCallback(async (runId: string) => {
    const [data, err] = await getRunEvents(runId);
    if (err || !data || !data.events) return;
    setRunEvents(prev => ({ ...prev, [runId]: data.events }));
  }, []);

  // Auto-fetch details and events for the latest run
  useEffect(() => {
    if (!latestRun?.id) return;
    loadRunDetail(latestRun.id);
    loadRunEvents(latestRun.id);
  }, [latestRun?.id, loadRunDetail, loadRunEvents]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchAll, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchAll]);

  // Load review queue when tab changes
  useEffect(() => {
    if (activeTab !== 'review') return;
    setIsReviewLoading(true);
    apiGetReviewQueue().then(([data, err]) => {
      if (data) setReviewQueue(data);
      setIsReviewLoading(false);
    });
  }, [activeTab]);

  // ── Submit analysis ────────────────────────────────────
  const handleSubmitAnalysis = async (country: string, pillarIds: number[] | null, indicatorIds: string[] | null, pdfUrl: string | null, llm: string) => {
    if (isSubmitting) {
      setFeedbackMessage({ text: "Another submission is in progress.", type: 'error' });
      return;
    }
    setIsSubmitting(true);
    setIsDashboardCardExpanded(true); // Auto-expand card when run starts
    setFeedbackMessage({ text: `Submitting analysis for ${country}...`, type: 'info' });

    const body: any = { country, llm_provider: llm };
    if (pdfUrl) body.pdf_url = pdfUrl;
    if (indicatorIds && indicatorIds.length > 0) {
      body.indicator_ids = indicatorIds;
    } else if (pillarIds && pillarIds.length > 0) {
      body.pillar_ids = pillarIds;
    }

    const [status, respBody] = await apiSubmitAnalysis(body);

    if (status === 200 || status === 202) {
      setFeedbackMessage({ text: `Analysis queued for ${country}.`, type: 'success' });
      await fetchAll();
      const [runsAfter] = await getRuns();
      if (runsAfter && runsAfter.length > 0) {
        const newRun = [...runsAfter].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
        setSelectedRunId(newRun.id);
        loadRunEvents(newRun.id);
      }
    } else {
      setFeedbackMessage({ text: `Submission failed: ${respBody}`, type: 'error' });
    }
    setIsSubmitting(false);
  };

  // ── Delete run ─────────────────────────────────────────
  const deleteAnalysisRun = async (runId: string) => {
    if (!window.confirm('Delete this run? This cannot be undone.')) return;
    const [status, body] = await apiDeleteRun(runId);
    if (status === 204) {
      setRuns(prev => prev.filter(r => r.id !== runId));
      setResultsByRun(prev => { const n = { ...prev }; delete n[runId]; return n; });
      setRunEvents(prev => { const n = { ...prev }; delete n[runId]; return n; });
      setFeedbackMessage({ text: "Run deleted.", type: 'info' });
    } else {
      setFeedbackMessage({ text: `Delete failed: ${body}`, type: 'error' });
    }
  };

  // ── Review Queue Actions ───────────────────────────────
  const handleAcceptReviewScore = (id: number) => {
    setFeedbackMessage({ text: "Score accepted (local only). Use API to persist.", type: 'info' });
  };

  const handleModifyReviewScore = (id: number, newScore: number) => {
    setFeedbackMessage({ text: `Score modified to ${newScore} (local only). Use API to persist.`, type: 'info' });
  };

  // ── Audit ──────────────────────────────────────────────
  const handleShowAudit = async (result: IndicatorResult) => {
    setSelectedAuditResult(result);
    setIsAuditOpen(true);
  };

  // ── Health-derived services ────────────────────────────
  const dbStatus = healthData?.services?.database === 'ok' ? 'Operational' : 'Error';
  const redisStatus = healthData?.services?.redis === 'ok' ? 'Connected' : 'Error';
  const workersOnline = healthData?.queue?.workers_online ?? 0;
  const queueDepth = healthData?.queue?.celery_queue_depth ?? 0;
  const activeLlm = healthData?.active_llm || healthData?.llm ? Object.keys(healthData.llm).find(k => healthData.llm![k]?.status === 'ok') || 'auto' : 'auto';

  const llmProviders = healthData?.llm
    ? Object.entries(healthData.llm as Record<string, { status: string; api_key_set: boolean; message?: string }>).reduce((acc, [key, val]) => {
        const names: Record<string, string> = { gemini: 'Gemini', openai: 'OpenAI', grok: 'Grok', deepseek: 'DeepSeek', minimax: 'MiniMax-M3', nvidia: 'Nvidia Free', ollama: 'Ollama' };
        acc[names[key] || key] = { ok: val.status === 'ok', keySet: val.api_key_set };
        return acc;
      }, {} as Record<string, { ok: boolean; keySet: boolean }>)
    : {};
  
  // ── Compute review items from API ──────────────────────
  const reviewItemsLocal: (IndicatorResult & { reason: string; country: string })[] = useMemo(() => {
    const items: (IndicatorResult & { reason: string; country: string })[] = [];
    runs.forEach(run => {
      const runResults = resultsByRun[run.id] || [];
      runResults.forEach(res => {
        const lowConfidence = res.confidence < 0.85;
        const hasGap = res.prosecution_score != null && res.defense_score != null && res.prosecution_score !== res.defense_score;
        if (lowConfidence || hasGap) {
          items.push({
            ...res,
            country: run.country,
            reason: lowConfidence ? 'Confidence below 0.85 threshold' : 'Prosecution & Defense score discrepancy',
          });
        }
      });
    });
    return items;
  }, [runs, resultsByRun]);

  // Use API review queue if available, otherwise compute locally
  const reviewItems = reviewQueue.length > 0
    ? reviewQueue.map(q => ({
        id: q.result_id,
        run_id: '',
        pillar_id: 0,
        indicator_id: q.indicator_id,
        raw_score: q.raw_score,
        act_and_practice: '',
        coverage: '',
        impact_comments: q.impact_comments,
        timeframe: '',
        references: '',
        note: '',
        confidence: 0,
        verbatim_quote: q.verbatim_quote,
        article_citation: q.article_citation,
        not_found: false,
        discovery_tag: '',
        processing_time: 0,
        mapping_rationale: q.mapping_rationale,
        country: q.country,
        reason: q.reason,
        prosecution_score: null,
        defense_score: null,
      } as IndicatorResult & { reason: string; country: string }))
    : reviewItemsLocal;

  // Filtering Runs List based on Tab & Sidebar states
  const filteredRuns = useMemo(() => {
    return runs.filter(run => {
      if (sidebarSearch) {
        const matchingCountry = run.country.toLowerCase().includes(sidebarSearch.toLowerCase());
        const matchingId = run.id.toLowerCase().includes(sidebarSearch.toLowerCase());
        const matchingLlm = run.llm_provider.toLowerCase().includes(sidebarSearch.toLowerCase());
        if (!matchingCountry && !matchingId && !matchingLlm) return false;
      }
      if (selectedPillarId !== null) {
        if (run.pillar_ids_requested && !run.pillar_ids_requested.includes(selectedPillarId)) {
          return false;
        }
      }
      if (runsFilter === 'ALL') return true;
      if (runsFilter === 'ACTIVE') return ['DISCOVERING', 'ANALYSING', 'RUNNING'].includes(run.status);
      return run.status === runsFilter;
    });
  }, [runs, runsFilter, sidebarSearch, selectedPillarId]);

  return (
    <div className="flex h-screen overflow-hidden">
      
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          >
            <WelcomeScreen onEnter={handleEnter} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SIDEBAR FRAME ─────────────────────────────────────────── */}
      <aside className="sidebar select-none">
        <div>
          {/* Logo Brand Header */}
          <div className="sidebar-logo">
            <div className="logo-mark">
              <Bolt className="w-4 h-4 animate-spin text-white" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <h1 className="logo-name font-bold leading-none">RDTII 2.1</h1>
              <span className="logo-tag">Compliance Engine</span>
            </div>
          </div>

          {/* Quick Search */}
          <div className="sidebar-search">
            <Search className="w-3.5 h-3.5 text-[var(--text-3)] shrink-0" />
            <input 
              type="text" 
              placeholder="Search index database..."
              value={sidebarSearch}
              onChange={e => setSidebarSearch(e.target.value)}
              className="bg-transparent border-none outline-hidden w-full text-xs"
            />
            {sidebarSearch ? (
              <button onClick={() => setSidebarSearch('')} className="text-[var(--text-3)] hover:text-white transition-colors">
                <X className="w-3 h-3" />
              </button>
            ) : (
              <span className="sidebar-kbd">⌘K</span>
            )}
          </div>

          {/* Navigation Links */}
          <div className="nav-section">
            <span className="nav-section-label">Compliance Console</span>
            
            <button 
              onClick={() => { setActiveTab('dashboard'); setSelectedPillarId(null); }}
              className={`nav-item ${activeTab === 'dashboard' && selectedPillarId === null ? 'active' : ''}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Compliance Dashboard</span>
            </button>

            <button 
              onClick={() => { setActiveTab('runs'); }}
              className={`nav-item ${activeTab === 'runs' ? 'active' : ''}`}
            >
              <Activity className="w-4 h-4" />
              <span className="flex-1">Execution Runs List</span>
              <span className="text-[10px] bg-[var(--border)] text-[var(--text-2)] px-1.5 py-0.5 rounded-full font-bold ml-auto">
                {runs.length}
              </span>
            </button>

            <button 
              onClick={() => { setActiveTab('results'); }}
              className={`nav-item ${activeTab === 'results' ? 'active' : ''}`}
            >
              <List className="w-4 h-4" />
              <span>All Results</span>
            </button>

            <button 
              onClick={() => { setActiveTab('indicators'); }}
              className={`nav-item ${activeTab === 'indicators' ? 'active' : ''}`}
            >
              <Sliders className="w-4 h-4" />
              <span>Indicators</span>
            </button>

            <button 
              onClick={() => { setActiveTab('token'); }}
              className={`nav-item ${activeTab === 'token' ? 'active' : ''}`}
            >
              <Coins className="w-4 h-4" />
              <span>Token Burn</span>
            </button>

            <button 
              onClick={() => { setActiveTab('countries'); }}
              className={`nav-item ${activeTab === 'countries' ? 'active' : ''}`}
            >
              <Globe className="w-4 h-4" />
              <span>Countries</span>
            </button>

            <button 
              onClick={() => { setActiveTab('logs'); }}
              className={`nav-item ${activeTab === 'logs' ? 'active' : ''}`}
            >
              <Terminal className="w-4 h-4" />
              <span>Live Logs</span>
            </button>

            <button 
              onClick={() => { setActiveTab('exports'); }}
              className={`nav-item ${activeTab === 'exports' ? 'active' : ''}`}
            >
              <FileDown className="w-4 h-4" />
              <span>Exports</span>
            </button>

            <button 
              onClick={() => { setActiveTab('audit'); }}
              className={`nav-item ${activeTab === 'audit' ? 'active' : ''}`}
            >
              <Eye className="w-4 h-4" />
              <span>Audit View</span>
            </button>

            <button 
              onClick={() => { setActiveTab('review'); }}
              className={`nav-item ${activeTab === 'review' ? 'active' : ''}`}
            >
              <Fingerprint className="w-4 h-4" />
              <span className="flex-1">Supervisor Review</span>
              {reviewItems.length > 0 && (
                <span className="text-[10px] bg-[var(--accent)] text-white px-2 py-0.5 rounded-full font-bold ml-auto animate-pulse">
                  {reviewItems.length}
                </span>
              )}
            </button>

            <button 
              onClick={() => { setActiveTab('docs'); }}
              className={`nav-item ${activeTab === 'docs' ? 'active' : ''}`}
            >
              <Code className="w-4 h-4" />
              <span>Developer API Docs</span>
            </button>
          </div>

          {/* Quick Scope Categories */}
          <div className="nav-section pt-2 border-t border-[var(--border)] mt-2">
            <span className="nav-section-label">Filter by Core Pillar</span>
            <div className="space-y-1 mt-1 max-h-[190px] overflow-y-auto pr-1">
              {PILLARS_REGISTRY.map((p) => (
                <button 
                  key={p.id}
                  onClick={() => {
                    setSelectedPillarId(p.id === selectedPillarId ? null : p.id);
                    setActiveTab('dashboard');
                  }}
                  className={`nav-item text-xs font-medium py-1.5 rounded-lg flex items-center justify-between ${
                    selectedPillarId === p.id ? 'active' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      p.id <= 4 ? 'bg-blue-500' : p.id <= 8 ? 'bg-amber-500' : 'bg-red-500'
                    }`} />
                    <span className="truncate">{p.id}. {p.name}</span>
                  </div>
                  {selectedPillarId === p.id && (
                    <Check className="w-3 h-3 text-[var(--accent)] shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <div className="flex items-center justify-between text-[11px] text-[var(--text-3)] font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping" />
              <span className="uppercase text-[10px] tracking-wider">Live System</span>
            </div>
            <span className="font-mono text-[9px]">v2.1-e</span>
          </div>
          <p className="text-[10px] text-[var(--text-3)] mt-1.5 leading-relaxed font-sans">
            UNESCAP Hackathon Pro Engine · Team Antigravity
          </p>
        </div>
      </aside>

      {/* ── MOBILE SIDEBAR OVERLAY ──────────────────────────── */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}>
          <aside className="sidebar select-none" onClick={e => e.stopPropagation()}>
            <div>
              <div className="sidebar-logo">
                <div className="logo-mark">
                  <Bolt className="w-4 h-4 animate-spin text-white" style={{ animationDuration: '6s' }} />
                </div>
                <div className="flex-1">
                  <h1 className="logo-name font-bold leading-none">RDTII 2.1</h1>
                  <span className="logo-tag">Compliance Engine</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="w-7 h-7 rounded-lg border border-[var(--border-med)] text-[var(--text-3)] hover:bg-[var(--surface2)] cursor-pointer flex items-center justify-center flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="sidebar-search">
                <Search className="w-3.5 h-3.5 text-[var(--text-3)] shrink-0" />
                <input type="text" placeholder="Search index database..." value={sidebarSearch} onChange={e => setSidebarSearch(e.target.value)} className="bg-transparent border-none outline-hidden w-full text-xs" />
                {sidebarSearch ? <button onClick={() => setSidebarSearch('')} className="text-[var(--text-3)] hover:text-white transition-colors"><X className="w-3 h-3" /></button> : <span className="sidebar-kbd">⌘K</span>}
              </div>

              <div className="nav-section">
                <span className="nav-section-label">Compliance Console</span>
                {[{id:'dashboard',icon:LayoutDashboard},{id:'runs',icon:Activity},{id:'results',icon:List},{id:'indicators',icon:Sliders},{id:'token',icon:Coins},{id:'countries',icon:Globe},{id:'logs',icon:Terminal},{id:'exports',icon:FileDown},{id:'audit',icon:Eye},{id:'review',icon:Fingerprint},{id:'docs',icon:Code}].map(nav => {
                  const Icn = nav.icon;
                  return (
                    <button key={nav.id} onClick={() => { setActiveTab(nav.id); setSelectedPillarId(null); setSidebarOpen(false); }} className={`nav-item ${activeTab === nav.id && (nav.id !== 'dashboard' || selectedPillarId === null) ? 'active' : ''}`}>
                      <Icn className="w-4 h-4" />
                      <span className="flex-1">
                        {nav.id === 'dashboard' && 'Compliance Dashboard'}
                        {nav.id === 'runs' && 'Execution Runs List'}
                        {nav.id === 'results' && 'All Results'}
                        {nav.id === 'indicators' && 'Indicators'}
                        {nav.id === 'token' && 'Token Burn'}
                        {nav.id === 'countries' && 'Countries'}
                        {nav.id === 'logs' && 'Live Logs'}
                        {nav.id === 'exports' && 'Exports'}
                        {nav.id === 'audit' && 'Audit View'}
                        {nav.id === 'review' && 'Supervisor Review'}
                        {nav.id === 'docs' && 'Developer API Docs'}
                      </span>
                      {nav.id === 'runs' && <span className="text-[10px] bg-[var(--border)] text-[var(--text-2)] px-1.5 py-0.5 rounded-full font-bold ml-auto">{runs.length}</span>}
                      {nav.id === 'review' && reviewItems.length > 0 && <span className="text-[10px] bg-[var(--accent)] text-white px-2 py-0.5 rounded-full font-bold ml-auto animate-pulse">{reviewItems.length}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="sidebar-footer">
              <div className="flex items-center justify-between text-[11px] text-[var(--text-3)] font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping" />
                  <span className="uppercase text-[10px] tracking-wider">Live System</span>
                </div>
                <span className="font-mono text-[9px]">v2.1-e</span>
              </div>
              <p className="text-[10px] text-[var(--text-3)] mt-1.5 leading-relaxed font-sans">UNESCAP Hackathon Pro Engine · Team Antigravity</p>
            </div>
          </aside>
        </div>
      )}

      {/* ── MAIN WORKSPACE CONTAINER ──────────────────────────────── */}
      <div className="main-wrap">
        
        {/* Top Header Bar */}
        <header className="topbar">
          <div className="flex items-center gap-2 min-w-0">
            {/* Hamburger for mobile */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="sidebar-hamburger hidden items-center justify-center w-8 h-8 rounded-lg border border-[var(--border-med)] text-[var(--text-2)] hover:bg-[var(--surface2)] cursor-pointer flex-shrink-0"
              title="Open sidebar"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <div>
              <h2 className="page-title select-none">
                  {activeTab === 'dashboard' && 'RDTII Policy Compliance Audits'}
                  {activeTab === 'runs' && 'Automated Execution Log History'}
                  {activeTab === 'results' && 'All Results'}
                  {activeTab === 'indicators' && 'All Indicators'}
                  {activeTab === 'token' && 'Token Burn'}
                  {activeTab === 'countries' && 'Analysed Countries'}
                  {activeTab === 'logs' && 'Live Logs'}
                  {activeTab === 'exports' && 'Exports'}
                  {activeTab === 'audit' && 'Audit View'}
                  {activeTab === 'review' && 'Human-in-the-Loop Override Queue'}
                  {activeTab === 'docs' && 'Compliance API Specifications'}
              </h2>
              <span className={`status-chip font-bold text-[10px] uppercase ${healthError ? 'bg-[var(--red-bg)] text-[var(--red)]' : 'bg-[var(--green-bg)] text-[var(--green)]'}`}>
                <span className={`status-dot ${healthError ? 'bg-[var(--red)]' : 'bg-[var(--green)]'}`} />
                {healthError ? "API Unreachable" : "API Connected"}
              </span>
            </div>
            <p className="page-sub select-none">
              API endpoint: <code className="text-[var(--accent)] font-bold font-mono">{API_BASE}</code>
            </p>
          </div>

          <div className="topbar-right">
            {/* Workstation Badge */}
            <div className="hidden lg:flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
              <span>WORKSTATION DEPLOYS ONLINE</span>
            </div>

            {/* Auto-Refresh Toggle */}
            <div className="toggle-row">
              <span className="toggle-label font-bold text-[10.5px] uppercase">Heartbeat</span>
              <button 
                onClick={() => {
                  setAutoRefresh(!autoRefresh);
                  setFeedbackMessage({
                    text: !autoRefresh 
                      ? "Automated background compliance checks enabled (Heartbeat active)." 
                      : "Background heartbeat checks disabled.",
                    type: "info"
                  });
                }}
                className={`toggle ${autoRefresh ? 'on' : ''}`}
                title="Toggle routine background monitoring checks"
              />
            </div>



            {/* Theme Trigger Button */}
            <button 
              onClick={() => setIsThemeDark(!isThemeDark)}
              className="theme-btn"
              title="Toggle system theme"
            >
              {isThemeDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* FEEDBACK BANNER ALERTS */}
        <AnimatePresence>
          {feedbackMessage && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="feedback-banner py-2.5 bg-[var(--accent-bg)] border-b border-[var(--accent)] text-[var(--text)] text-xs font-semibold flex items-center justify-between select-none"
            >
              <div className="flex items-center gap-2">
                <span className="text-[var(--accent)]">⚡</span>
                <span>{feedbackMessage.text}</span>
              </div>
              <button onClick={() => setFeedbackMessage(null)} className="hover:opacity-70 text-[var(--text-3)] hover:text-[var(--text)] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CENTRAL SCROLLABLE CONTAINER */}
        <main className="page-content flex-1 overflow-y-auto">

          {/* ──────────────── TAB: DASHBOARD ──────────────── */}
          {activeTab === 'dashboard' && (
            <div className="flex flex-col gap-6">
              
              {/* Dynamic stats cards */}
              <StatsPanel runs={runs} />

              {/* Submissions Form */}
              <div className="w-full">
                <NewAnalysisForm 
                  onSubmit={(c, p, indIds, pdf, llm) => handleSubmitAnalysis(c, p, indIds, pdf, llm)}
                  isSubmitting={isSubmitting}
                />
              </div>

              {/* Primary Compliance runs panel */}
              <section className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-xs">
                <div className="border-b border-[var(--border)] pb-4 mb-4">
                  <div>
                    <h3 className="text-base font-semibold text-[var(--text)] flex items-center gap-2">
                      <ListChecks className="w-4 h-4 text-[var(--accent)]" />
                      Latest Active Compliance Database
                    </h3>
                    <p className="text-xs text-[var(--text-3)] mt-0.5">
                      Most recent legislative audit — structured under exact 9-column compliance criteria.
                    </p>
                  </div>
                </div>

                {/* Main list components */}
                <div className="space-y-4">
                  {runs.length === 0 || !latestRun ? (
                    <div className="py-12 border border-dashed border-[var(--border)] rounded-xl flex flex-col items-center justify-center text-[var(--text-3)] gap-2">
                      <Sliders className="w-10 h-10 text-[var(--border-med)]" />
                      <span className="text-sm font-semibold text-[var(--text)]">
                        No runs yet.
                      </span>
                      <span className="text-xs max-w-xs text-center">
                        Submit a new analysis above to see the latest compliance database.
                      </span>
                    </div>
                  ) : (
                    <DashboardLatestRunCard 
                      runObj={latestRun}
                      isExpanded={isDashboardCardExpanded}
                      onToggleExpand={() => setIsDashboardCardExpanded(prev => !prev)}
                      resultsByRun={resultsByRun}
                      runEvents={runEvents}
                      isThemeDark={isThemeDark}
                      onDeleteRun={deleteAnalysisRun}
                      onOpenAudit={(result) => {
                        setSelectedAuditResult(result);
                        setIsAuditOpen(true);
                      }}
                    />
                  )}
                </div>
              </section>

              {/* Infrastructure server monitor indicators */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Services status */}
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-xs">
                  <h4 className="text-xs font-bold text-[var(--text-3)] uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-[var(--accent)]" /> Backend Services
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    
                    <div className="p-3 bg-[var(--surface2)] rounded-lg border border-[var(--border)] flex flex-col justify-between h-[80px]">
                      <div>
                        <span className="text-[var(--text-3)] block text-[10px] uppercase font-bold tracking-wider">PostgreSQL</span>
                        <span className={`font-bold block mt-1 flex items-center gap-1 text-xs ${dbStatus === 'Operational' ? 'text-emerald-500' : 'text-red-500'}`}>
                          {dbStatus === 'Operational' ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />} {dbStatus}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-[var(--surface2)] rounded-lg border border-[var(--border)] flex flex-col justify-between h-[80px]">
                      <div>
                        <span className="text-[var(--text-3)] block text-[10px] uppercase font-bold tracking-wider">Redis</span>
                        <span className={`font-bold block mt-1 flex items-center gap-1 text-xs ${redisStatus === 'Connected' ? 'text-emerald-500' : 'text-red-500'}`}>
                          {redisStatus === 'Connected' ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />} {redisStatus}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-[var(--surface2)] rounded-lg border border-[var(--border)] flex flex-col justify-between h-[80px]">
                      <div>
                        <span className="text-[var(--text-3)] block text-[10px] uppercase font-bold tracking-wider">Celery Workers</span>
                        <span className="font-bold block text-[var(--text-2)] mt-1 flex items-center gap-1 text-xs">
                          {workersOnline} worker{workersOnline !== 1 ? 's' : ''} online
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-[var(--surface2)] rounded-lg border border-[var(--border)] flex flex-col justify-between h-[80px]">
                      <div>
                        <span className="text-[var(--text-3)] block text-[10px] uppercase font-bold tracking-wider">Queue Depth</span>
                        <span className="font-bold block text-[var(--accent)] mt-1 flex items-center gap-1 text-xs font-mono">
                          {queueDepth} task{queueDepth !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* AI API status keys */}
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-3)] uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <MessageSquareCode className="w-3.5 h-3.5 text-[var(--accent)]" /> LLM Providers
                    </h4>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {Object.keys(llmProviders).length === 0 ? (
                        <span className="text-[11px] text-[var(--text-3)]">No provider status available</span>
                      ) : (
                        Object.entries(llmProviders).map(([name, status]) => (
                          <span key={name} className={`pill font-bold ${status.ok ? 'pill-green' : status.keySet ? 'pill-red' : 'pill-gray'}`}>
                            {status.ok ? <Check className="w-3 h-3" /> : status.keySet ? <X className="w-3 h-3" /> : <Lock className="w-3 h-3" />} {name}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="pt-4 border-t border-[var(--border)] mt-4 text-[10.5px] font-bold uppercase tracking-wider text-[var(--text-3)] flex items-center justify-between">
                    <span>Active LLM:</span>
                    <strong className="text-[var(--accent)] font-mono">{activeLlm}</strong>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ──────────────── TAB: RUNS LIST ──────────────── */}
          {activeTab === 'runs' && (
            <div className="space-y-6">
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-xs">
                <div className="border-b border-[var(--border)] pb-4 mb-4">
                  <h3 className="text-base font-semibold text-[var(--text)] flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[var(--accent)] animate-pulse" />
                    Regulatory Analysis Pipeline Run-History
                  </h3>
                  <p className="text-xs text-[var(--text-3)] mt-0.5">
                    Full history logs of active web searches, document classifications, and consensus score overrides.
                  </p>
                </div>

                {isLoadingRuns ? (
                  <div className="py-12 flex flex-col items-center justify-center text-[var(--text-3)] gap-2">
                    <span className="w-5 h-5 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                    <span className="text-xs">Loading runs from API...</span>
                  </div>
                ) : runs.length === 0 ? (
                  <div className="py-12 text-center text-xs text-[var(--text-3)]">
                    No runs found. Submit a new analysis to get started.
                  </div>
                ) : runs.map((rObj) => {
                    const isSelected = selectedRunId === rObj.id;
                    return (
                      <div 
                        key={rObj.id} 
                        className={`p-4 rounded-xl border transition-all ${
                          isSelected 
                            ? 'border-[var(--accent)] bg-[var(--accent-bg)]' 
                            : 'border-[var(--border)] hover:border-[var(--border-med)]'
                        }`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text-2)] font-black text-xs uppercase font-mono">
                              {rObj.country.slice(0, 3)}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-[var(--text)]">
                                {rObj.country} Compliance Audit Job
                              </h4>
                              <p className="text-[11px] text-[var(--text-3)] font-mono mt-0.5">
                                Run ID: {rObj.id} · Provider: {rObj.llm_provider}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className={`pill ${rObj.status === 'COMPLETE' ? 'pill-green' : 'pill-amber'}`}>
                              {rObj.status}
                            </span>
                            <button 
                              onClick={() => {
                                setSelectedRunId(rObj.id);
                                setActiveTab('dashboard');
                                setFeedbackMessage({
                                  text: `Showing compliance map indicators for ${rObj.country}.`,
                                  type: 'info'
                                });
                              }}
                              className="btn btn-ghost font-bold text-xs"
                            >
                              Open Indicator Map
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* ──────────────── TAB: RUNS LIST ──────────────── */}

          {/* ──────────────── TAB: ALL RESULTS ──────────────── */}
          {activeTab === 'results' && <AllResultsPanel />}

          {/* ──────────────── TAB: INDICATORS ──────────────── */}
          {activeTab === 'indicators' && (
            <IndicatorsPanel onAudit={(result) => {
              setSelectedAuditResult(result);
              setIsAuditOpen(true);
            }} />
          )}

          {/* ──────────────── TAB: TOKEN BURN ──────────────── */}
          {activeTab === 'token' && <TokenBurnPanel />}

          {/* ──────────────── TAB: COUNTRIES ──────────────── */}
          {activeTab === 'countries' && <CountriesPanel />}

          {/* ──────────────── TAB: LIVE LOGS ──────────────── */}
          {activeTab === 'logs' && <LiveLogsPanel />}

          {/* ──────────────── TAB: EXPORTS ──────────────── */}
          {activeTab === 'exports' && <ExportsPanel />}

          {/* ──────────────── TAB: AUDIT VIEW ──────────────── */}
          {activeTab === 'audit' && <AuditViewPanel />}

          {/* ──────────────── TAB: REVIEW QUEUE ──────────────── */}
          {activeTab === 'review' && (
            <ReviewQueuePanel 
              items={reviewItems}
              onAcceptScore={handleAcceptReviewScore}
              onModifyScore={handleModifyReviewScore}
              onRefresh={() => {
                setIsReviewLoading(true);
                apiGetReviewQueue().then(([data]) => {
                  if (data) setReviewQueue(data);
                  setIsReviewLoading(false);
                });
                setFeedbackMessage({
                  text: "Review queue refreshed.",
                  type: 'info'
                });
              }}
              isLoading={isReviewLoading}
            />
          )}

          {/* ──────────────── TAB: DEVELOPER DOCS ──────────────── */}
          {activeTab === 'docs' && (
            <div className="space-y-6">
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-xs space-y-4">
                <div className="border-b border-[var(--border)] pb-4">
                  <h3 className="text-base font-semibold text-[var(--text)] flex items-center gap-2">
                    <Code className="w-4 h-4 text-[var(--accent)]" />
                    RDTII Compliance Engine §2.1 Schema API Specifications
                  </h3>
                  <p className="text-xs text-[var(--text-3)] mt-0.5">
                    FastAPI automated endpoint integration logs to integrate Celery asynchronous worker threads.
                  </p>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="bg-[var(--log-bg)] border border-[var(--border)] rounded-lg p-4">
                    <div className="flex items-center gap-2 text-emerald-500 font-bold uppercase text-[11px]">
                      <span className="p-1 px-2 rounded bg-emerald-500/10 text-[10px] border border-emerald-500/10">POST</span>
                      <span>/api/v1/analysis/run</span>
                    </div>
                    <p className="text-[11.5px] text-[var(--text-2)] mt-2">
                      Submits a custom economy target, launching web crawling spiders, statutory HTML downloads, and triggers multi-agent debates.
                    </p>
                    <pre className="mt-2.5 p-3.5 bg-slate-900 text-gray-300 rounded font-mono text-[10px] overflow-x-auto leading-relaxed border border-slate-800">
{`{
  "country": "Thailand",
  "pillar_ids_requested": [6, 7],
  "pdf_override_url": null,
  "model_provider": "gemini-1.5-flash"
}`}
                    </pre>
                  </div>

                  <div className="bg-[var(--log-bg)] border border-[var(--border)] rounded-lg p-4">
                    <div className="flex items-center gap-2 text-sky-500 font-bold uppercase text-[11px]">
                      <span className="p-1 px-2 rounded bg-sky-500/10 text-[10px] border border-sky-500/10">GET</span>
                      <span>/api/v1/analysis/results/{"{run_id}"}</span>
                    </div>
                    <p className="text-[11.5px] text-[var(--text-2)] mt-2">
                      Retrieves resolved 9-column compliance results along with low confidence alerts for supervisors.
                    </p>
                    <pre className="mt-2.5 p-3.5 bg-slate-900 text-gray-300 rounded font-mono text-[10px] overflow-x-auto leading-relaxed border border-slate-800">
{`{
  "run_id": "run-thailand-8472",
  "status": "COMPLETE",
  "accuracy_confidence": 0.94,
  "data_rows_matched": 12
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>

        {/* Outer Workspace Footer */}
        <footer className="footer select-none">
                <span>
                  RDTII 2.1 Compliance Engine · Team SUPERNOVA · UNESCAP Hackathon 2026
                </span>
                <span className="flex items-center gap-1.5 text-[var(--text-3)]">
                  {healthError ? (
                    <><X className="w-3 h-3 text-red-500" /> API Unreachable</>
                  ) : (
                    <><Check className="w-3 h-3 text-emerald-500" /> All systems operational</>
                  )}
                </span>
        </footer>

        {/* ── INTERACTIVE AUDIT MODAL FRAME ───────────────────────── */}
        <AnimatePresence>
          {isAuditOpen && selectedAuditResult && (
            <AuditModal
              isOpen={isAuditOpen}
              onClose={() => {
                setIsAuditOpen(false);
                setSelectedAuditResult(null);
              }}
              result={selectedAuditResult}
              documents={documentsByRun[selectedAuditResult.run_id] || []}
            />
          )}
        </AnimatePresence>

        </div>
      </div>
  );
}

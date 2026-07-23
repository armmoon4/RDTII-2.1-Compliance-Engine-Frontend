const API_BASE = (() => {
  const stored = window.localStorage.getItem('rdtii_api_base');
  if (stored) return stored.replace(/\/$/, '');
  return window.location.origin.startsWith('file://') ? 'http://localhost:8000' : window.location.origin;
})();

function fetchTimeout(ms: number) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  return { signal: ctrl.signal, clear: () => clearTimeout(id) };
}

async function apiGet<T>(path: string, retries = 3): Promise<[T | null, string | null]> {
  for (let i = 0; i < retries; i++) {
    try {
      const t = fetchTimeout(25000);
      const r = await fetch(API_BASE + path, { signal: t.signal });
      t.clear();
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return [await r.json() as T, null];
    } catch (e: unknown) {
      if (i < retries - 1) await sleep(2000);
      else return [null, e instanceof Error ? e.message : String(e)];
    }
  }
  return [null, 'Max retries exceeded'];
}

async function apiPost<T>(path: string, body: unknown): Promise<[number, string]> {
  for (let i = 0; i < 3; i++) {
    try {
      const t = fetchTimeout(25000);
      const r = await fetch(API_BASE + path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: t.signal,
      });
      t.clear();
      return [r.status, await r.text()];
    } catch (e: unknown) {
      if (i < 2) await sleep(2000);
      else return [0, e instanceof Error ? e.message : String(e)];
    }
  }
  return [0, 'Max retries exceeded'];
}

async function apiDelete(path: string): Promise<[number, string]> {
  for (let i = 0; i < 3; i++) {
    try {
      const t = fetchTimeout(25000);
      const r = await fetch(API_BASE + path, { method: 'DELETE', signal: t.signal });
      t.clear();
      return [r.status, await r.text()];
    } catch (e: unknown) {
      if (i < 2) await sleep(2000);
      else return [0, e instanceof Error ? e.message : String(e)];
    }
  }
  return [0, 'Max retries exceeded'];
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

export interface HealthResponse {
  status: string;
  version?: string;
  services?: { database: string; redis: string };
  queue?: { workers_online: number; celery_queue_depth: number };
  llm?: Record<string, { status: string; api_key_set: boolean; message?: string; base_url?: string }>;
  active_llm?: string;
}

export interface AnalysisRun {
  id: string;
  country: string;
  status: string;
  pillar_ids_requested?: number[];
  pdf_url?: string | null;
  error_message?: string | null;
  celery_task_id?: string | null;
  created_at: string;
  completed_at?: string | null;
  total_indicators: number;
  completed_indicators: number;
  llm_provider: string;
  current_activity?: string;
}

export interface IndicatorResult {
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

export interface PipelineEvent {
  id: number;
  run_id: string;
  event_type: string;
  agent: string;
  indicator_id: string;
  message: string;
  data: string | null;
  created_at: string;
}

export interface RunDetailResponse {
  id: string;
  country: string;
  status: string;
  indicator_results: IndicatorResult[];
  documents?: { id: number; run_id: string; url: string; title: string; language: string; source_type: string; enforcement_status: string; zone1_passed: boolean; download_status: string; created_at: string }[];
}

export interface AuditResponse {
  result_id: number;
  indicator_id: string;
  country: string;
  pillar_id: number;
  raw_score: number | null;
  confidence: number;
  act_and_practice: string;
  article_citation: string;
  verbatim_quote: string;
  references: string;
  impact_comments: string;
  mapping_rationale: string;
  source_documents: { id: number; source_type: string; url: string; title: string; language: string; ocr_quality_cer: number }[];
}

export interface ReviewQueueItem {
  result_id: number;
  indicator_id: string;
  country: string;
  raw_score: number | null;
  reason: string;
  impact_comments: string;
  verbatim_quote: string;
  article_citation: string;
  mapping_rationale: string;
}

export interface TokenUsage {
  run_id: string;
  country: string;
  status: string;
  llm_provider: string;
  total_input_tokens: number;
  total_output_tokens: number;
  total_tokens: number;
  estimated_cost_usd: number;
  indicators_analysed: number;
}

// ── API Functions ────────────────────────────────────────

export function getApiBase() { return API_BASE; }

export async function getHealth() { return apiGet<HealthResponse>('/health'); }

export async function getRuns() { return apiGet<AnalysisRun[]>('/api/v1/analysis/runs'); }

export async function getRunDetail(runId: string) { return apiGet<RunDetailResponse>(`/api/v1/analysis/${runId}`); }

export async function getRunEvents(runId: string, limit = 40) {
  return apiGet<{ events: PipelineEvent[] }>(`/api/v1/analysis/${runId}/events?offset=0&limit=${limit}`);
}

export async function submitAnalysis(body: { country: string; llm_provider?: string; indicator_ids?: string[]; pillar_ids?: number[] }) {
  return apiPost('/api/v1/analysis/run', body);
}

export async function deleteRun(runId: string) { return apiDelete(`/api/v1/analysis/${runId}`); }

export async function getIndicators() { return apiGet<unknown[]>('/api/v1/analysis/indicators'); }

export async function getTokenUsage(limit = 50) { return apiGet<TokenUsage[]>(`/api/v1/analysis/token-usage?limit=${limit}`); }

export async function getCountries() { return apiGet<string[]>('/api/v1/analysis/countries'); }

export async function getAllResults(limit = 50, offset = 0) {
  return apiGet<IndicatorResult[]>(`/api/v1/analysis/results/all?limit=${limit}&offset=${offset}`);
}

export async function getAuditResult(resultId: number) {
  return apiGet<AuditResponse>(`/api/v1/analysis/audit/${resultId}`);
}

export async function getReviewQueue(limit = 50) {
  return apiGet<ReviewQueueItem[]>(`/api/v1/analysis/review/queue?limit=${limit}`);
}

export const EXPORT_BASE = API_BASE;

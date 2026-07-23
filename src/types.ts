export interface DiscoveredDocument {
  id: number;
  run_id: string;
  url: string;
  title: string;
  language: string;
  source_type: string; // "PRIMARY_HIGH" | "PRIMARY_GAZETTE" | "PRIMARY_MEDIUM" | "SECONDARY_LEAD" | "SECONDARY_APPROVED" | "EXCLUDED"
  enforcement_status: string;
  zone1_passed: boolean;
  original_content?: string;
  translated_content?: string;
  content_hash?: string;
  download_status: string;
  indicator_id?: string;
  search_query_used?: string;
  created_at: string;
}

export interface IndicatorResult {
  id: number;
  run_id: string;
  pillar_id: number;
  indicator_id: string;
  raw_score: number | null; // 0.0 | 0.5 | 1.0
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
  prosecution_score: number | null;
  defense_score: number | null;
  arbiter_score: number | null;
  discovery_tag: string;
  source_pdf_path: string | null;
  location_ref: string | null;
  processing_time: number;
  mapping_rationale: string;
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

export interface HealthStatus {
  status: 'ok' | 'degraded' | 'error';
  database: 'ok' | 'error';
  redis: 'ok' | 'error';
  version: string;
  timestamp: string;
  services?: {
    database: 'ok' | 'error';
    redis: 'ok' | 'error';
  };
  queue?: {
    workers_online: number;
    celery_queue_depth: number;
  };
  llm?: {
    active: string;
    gemini?: { status: string; api_key_set: boolean; message?: string };
    openai?: { status: string; api_key_set: boolean; message?: string };
    grok?: { status: string; api_key_set: boolean; message?: string };
    deepseek?: { status: string; api_key_set: boolean; message?: string };
    minimax?: { status: string; api_key_set: boolean; message?: string };
    nvidia?: { status: string; api_key_set: boolean; message?: string };
    ollama?: { status: string; api_key_set: boolean; message?: string };
  };
}

import { motion } from 'motion/react';
import { X, FileText, Gavel, Shield, Scale, Link2, BookOpen, Clock, Globe } from 'lucide-react';
import { IndicatorResult, DiscoveredDocument } from '../types';

interface AuditProps {
  isOpen: boolean;
  onClose: () => void;
  result: IndicatorResult | null;
  documents: DiscoveredDocument[];
}

export default function AuditModal({ isOpen, onClose, result, documents }: AuditProps) {
  if (!isOpen || !result) return null;

  const getScoreBadgeClass = (score: number | null) => {
    if (score === null) return 'bg-[var(--bg)] text-[var(--text-4)]';
    if (score >= 1.0) return 'bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/40 dark:text-rose-400';
    if (score >= 0.5) return 'bg-amber-50 border border-amber-200 text-amber-600 dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-400';
    return 'bg-emerald-50 border border-emerald-200 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-400';
  };

  const getScoreMeaning = (score: number | null) => {
    if (score === null) return 'No evaluation';
    if (score >= 1.0) return 'Full Restriction / Absolute Prohibition';
    if (score >= 0.5) return 'Partial Restriction / Conditional exception framework';
    return 'Unrestricted / Free practice standard';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4" id="audit-modal-root">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs"
      />

      {/* Content modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', duration: 0.4 }}
        className="relative bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] p-5 bg-[var(--surface2)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/15 text-amber-500 rounded-lg">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-amber-500 tracking-wider uppercase bg-amber-500/10 px-2 py-0.5 rounded">
                  Indicator {result.indicator_id}
                </span>
                <span className="text-[10px] text-[var(--text-3)] font-semibold uppercase tracking-wider bg-[var(--bg)] px-1.5 py-0.5 rounded">
                  {result.discovery_tag} TAG
                </span>
              </div>
              <h2 className="text-base font-semibold text-[var(--text)] mt-1">
                Adversarial Debate Regulatory Audit
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-3)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* Top Score summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[var(--surface2)] border border-[var(--border)]">
              <span className="text-[10px] font-semibold text-[var(--text-3)] uppercase tracking-widest block">
                Final Consensus Score
              </span>
              <div className="flex items-center gap-3 mt-1.5">
                <span className={`text-2xl font-bold px-3 py-1 rounded-lg ${getScoreBadgeClass(result.raw_score)}`}>
                  {result.raw_score !== null ? result.raw_score.toFixed(1) : '—'}
                </span>
                <div>
                  <span className="text-xs font-semibold text-[var(--text)] block">
                    {result.not_found ? 'Not Found / Silent' : 'Scored'}
                  </span>
                  <span className="text-[10px] text-[var(--text-3)] block font-medium">
                    {getScoreMeaning(result.raw_score)}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[var(--surface2)] border border-[var(--border)]">
              <span className="text-[10px] font-semibold text-[var(--text-3)] uppercase tracking-widest block">
                Arbiter Confidence Metric
              </span>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 bg-[var(--bg)] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-sky-500 h-full rounded-full"
                    style={{ width: `${result.confidence * 100}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-[var(--text-2)] font-mono">
                  {(result.confidence * 100).toFixed(0)}%
                </span>
              </div>
              <span className="text-[10px] text-[var(--text-3)] block mt-1 font-medium">
                Calculated over semantic proximity and verification consensus
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[var(--surface2)] border border-[var(--border)]">
              <span className="text-[10px] font-semibold text-[var(--text-3)] uppercase tracking-widest block">
                Processing Speed Metrics
              </span>
              <div className="flex items-center gap-2 mt-1.5 text-[var(--text-2)]">
                <Clock className="w-4 h-4 text-[var(--text-3)]" />
                <span className="text-sm font-bold font-mono">
                  {result.processing_time.toFixed(2)}s
                </span>
                <span className="text-[10px] text-[var(--text-3)]">
                  Total pipeline latency
                </span>
              </div>
              <span className="text-[10px] text-[var(--text-3)] block mt-1.5 font-medium uppercase">
                Tag: <strong className="text-emerald-500">{result.discovery_tag}</strong>
              </span>
            </div>
          </div>

          {/* Adversarial agents debate log */}
          <div>
            <h3 className="text-xs font-bold text-[var(--text-3)] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Adversarial Evaluation Dialogues
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Prosecution */}
              <div className="border border-indigo-100 dark:border-indigo-950/45 rounded-xl p-4 bg-indigo-50/15 dark:bg-indigo-950/5">
                <div className="flex items-center justify-between border-b border-indigo-100/40 dark:border-indigo-950/20 pb-2 mb-2.5">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 uppercase">
                    <Gavel className="w-3.5 h-3.5" /> Prosecution Agent
                  </span>
                  <span className="text-[11px] font-mono text-indigo-500 bg-indigo-500/10 px-2 rounded font-medium">
                    Proposed: {result.prosecution_score !== null ? result.prosecution_score.toFixed(1) : '—'}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-2)] leading-relaxed font-sans">
                  Searched for target restrictions, commercial compliance barriers, and statutory bans within secondary and primary gazettes. 
                  Argumentation targets horizontal liability and penal protocols.
                </p>
                <div className="mt-2 text-[11px] text-indigo-500 font-semibold">
                  Primary target: <span className="underline">{result.article_citation || 'None cited'}</span>
                </div>
              </div>

              {/* Defense */}
              <div className="border border-emerald-100 dark:border-emerald-950/45 rounded-xl p-4 bg-emerald-50/15 dark:bg-emerald-950/5">
                <div className="flex items-center justify-between border-b border-emerald-100/40 dark:border-emerald-950/20 pb-2 mb-2.5">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 uppercase">
                    <Shield className="w-3.5 h-3.5" /> Defense Agent
                  </span>
                  <span className="text-[11px] font-mono text-emerald-500 bg-emerald-500/10 px-2 rounded font-medium">
                    Adjusted: {result.defense_score !== null ? result.defense_score.toFixed(1) : '—'}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-2)] leading-relaxed font-sans">
                  Sought statutory carveouts, contractual safe harbors, consent workarounds, executive waivers, and ministerial exemptions. 
                  Identified standard contracts or whitelist exclusions to lower compliance friction rates.
                </p>
                <div className="mt-2 text-[11px] text-emerald-500 font-semibold">
                  Primary exception: <span className="underline">{result.references ? 'Present' : 'None found'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Act, references, & practice */}
          <div className="border border-[var(--border)] bg-[var(--surface2)] rounded-xl p-5 space-y-4">
            <div className="flex items-start gap-3">
              <BookOpen className="w-4 h-4 text-[var(--text-3)] mt-1 shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-[var(--text-3)] uppercase tracking-widest">
                  Statutory Enactment & Administrative Practice
                </span>
                <p className="text-sm font-semibold text-[var(--text)] mt-1">
                  {result.act_and_practice || 'None declared'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-[var(--border)]">
              <div>
                <span className="text-[10px] font-bold text-[var(--text-3)] uppercase tracking-widest block">
                  Coverage Domain
                </span>
                <span className="text-xs text-[var(--text-2)] mt-1 block font-medium">
                  {result.coverage || 'Horizontal - All Commerce Sectors'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[var(--text-3)] uppercase tracking-widest block">
                  Legislation Timeframe
                </span>
                <span className="text-xs text-[var(--text-2)] mt-1 block font-medium">
                  {result.timeframe || 'Currently enforced'}
                </span>
              </div>
            </div>

            {result.verbatim_quote && result.verbatim_quote !== '—' && (
              <div className="mt-4 pt-4 border-t border-[var(--border)]">
                <span className="text-[10px] font-bold text-[var(--text-3)] uppercase tracking-wider block mb-2">
                  Highlight: Lexical Verbatim Snippet (Ground Truth Evidence)
                </span>
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-3.5">
                  <p className="text-xs font-medium text-[var(--text)] italic font-sans leading-relaxed">
                    "{result.verbatim_quote}"
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-[var(--text-3)] font-mono">
                    <span>Citation: {result.article_citation || 'N/A'}</span>
                    {result.location_ref && <span>Source ref: {result.location_ref}</span>}
                  </div>
                </div>
              </div>
            )}

            <div>
              <span className="text-[10px] font-bold text-[var(--text-3)] uppercase tracking-widest block ml-0.5 mb-1.5">
                Arbiter Decision Rationale & Score Mapping
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-sans bg-amber-500/5 dark:bg-amber-500/3 p-3.5 rounded-lg border border-amber-500/10">
                {result.mapping_rationale || 'Consensus scored without major contradictions.'}
              </p>
            </div>
          </div>

          {/* Discovered documents */}
          <div>
            <h3 className="text-xs font-bold text-[var(--text-3)] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" /> Source Document Attributions ({documents.length})
            </h3>
            <div className="space-y-2">
              {documents.length === 0 ? (
                <div className="text-xs text-[var(--text-3)] italic p-3 text-center bg-[var(--surface2)] rounded-lg border border-[var(--border)]">
                  No direct legal documents attributed.
                </div>
              ) : (
                documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-[var(--surface2)] border border-[var(--border)] rounded-lg p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                    id={`doc-row-${doc.id}`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="p-1 px-1.5 bg-[var(--bg)] text-[var(--text-2)] font-mono text-[9px] font-bold rounded mt-0.5 tracking-wider">
                        {doc.source_type}
                      </div>
                      <div>
                        <h4 className="font-semibold text-[var(--text)]">
                          {doc.title}
                        </h4>
                        <div className="text-[10px] text-[var(--text-3)] mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <span className="uppercase">Language: {doc.language}</span>
                          <span>•</span>
                          <span>Status: <span className="text-emerald-500 font-medium">{doc.enforcement_status}</span></span>
                          {doc.download_status && (
                            <>
                              <span>•</span>
                              <span className="text-sky-500 font-semibold">{doc.download_status}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 font-mono text-[10px] font-bold text-sky-600 dark:text-sky-400 hover:underline bg-sky-500/10 px-2 py-1 rounded transition-colors break-all"
                      >
                        <Link2 className="w-3 h-3" /> Source URL
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="border-t border-[var(--border)] p-4 bg-[var(--surface2)] flex items-center justify-between gap-4">
          <span className="text-[10px] text-[var(--text-3)] font-medium">
            RDTII Compliance Engine §2.1 Compliance standard validation system.
          </span>
          <button
            onClick={onClose}
            className="btn btn-ghost cursor-pointer"
          >
            Close View
          </button>
        </div>
      </motion.div>
    </div>
  );
}

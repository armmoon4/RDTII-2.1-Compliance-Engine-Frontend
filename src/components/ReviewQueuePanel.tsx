import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Fingerprint, Check, AlertCircle, Edit3, HelpCircle, RotateCcw } from 'lucide-react';
import { IndicatorResult } from '../types';

interface ReviewQueueProps {
  items: (IndicatorResult & { reason: string; country: string })[];
  onAcceptScore: (id: number) => void;
  onModifyScore: (id: number, newScore: number) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export default function ReviewQueuePanel({
  items,
  onAcceptScore,
  onModifyScore,
  onRefresh,
  isLoading
}: ReviewQueueProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingScore, setEditingScore] = useState<number>(0.5);

  const handleEditClick = (item: IndicatorResult) => {
    setEditingId(item.id);
    setEditingScore(item.raw_score ?? 0.5);
  };

  const handleSaveEdit = (id: number) => {
    onModifyScore(id, editingScore);
    setEditingId(null);
  };

  return (
    <div className="card" id="review-queue-panel">
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-4">
        <div>
          <h3 className="card-title flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-amber-500 animate-pulse-slow" />
            Human-in-the-Loop Review Queue
          </h3>
          <p className="card-desc">
            Indicators flagged due to low confidence metrics, missing evidence clauses, or severe Prosecution/Defense agent disputes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-500">
            {items.length} Flagged Indicators
          </span>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-1 px-2.5 rounded-lg border border-[var(--border-med)] bg-[var(--surface2)] text-[var(--text-2)] hover:bg-[var(--bg)] text-xs font-medium transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reload List
          </button>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-[var(--text-3)] gap-2">
            <span className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            <span className="text-xs">Consolidating unresolved queries...</span>
          </div>
        ) : items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-10 text-center flex flex-col items-center justify-center text-[var(--text-3)] gap-2"
          >
            <Check className="w-10 h-10 text-emerald-500" />
            <span className="text-sm font-semibold text-[var(--text)]">
              Review Queue Clean!
            </span>
            <span className="text-xs max-w-sm">
              All indicator consensus calculations have passed the 0.70 confidence threshold safely.
            </span>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {items.map((item, index) => {
              const isEditing = editingId === item.id;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: index * 0.05 }}
                  className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface2)] hover:border-[var(--border-med)] transition-colors"
                  id={`review-item-${item.id}`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-mono text-xs text-sky-600 dark:text-sky-450">
                          {item.country} Run
                        </span>
                        <span className="font-mono font-semibold text-xs text-amber-500 tracking-wider uppercase bg-amber-500/10 px-2 py-0.5 rounded">
                          Ind {item.indicator_id}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-[var(--text-3)] bg-[var(--bg)] px-1.5 py-0.5 rounded">
                          Pillar {item.pillar_id}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-rose-500 font-semibold uppercase tracking-wider">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>Flag: {item.reason}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right mr-2 hidden md:block">
                        <div className="text-[10px] text-[var(--text-3)] font-bold uppercase tracking-wider">
                          Consensus Rating Offer
                        </div>
                        <div className="text-xs font-bold text-[var(--text-2)]">
                          Score: <span className="text-amber-500">{item.raw_score !== null ? item.raw_score.toFixed(2) : 'Silent'}</span>
                        </div>
                      </div>

                      {isEditing ? (
                        <div className="flex items-center gap-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg p-1">
                          {[0.0, 0.5, 1.0].map((s) => (
                            <button
                              key={s}
                              onClick={() => setEditingScore(s)}
                              className={`p-1 px-2.5 rounded font-mono text-xs font-bold transition-all cursor-pointer ${
                                editingScore === s
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'text-[var(--text-3)] hover:bg-[var(--bg)]'
                              }`}
                            >
                              {s.toFixed(1)}
                            </button>
                          ))}
                          <button
                            onClick={() => handleSaveEdit(item.id)}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white p-1 px-2.5 rounded text-xs font-semibold cursor-pointer"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => onAcceptScore(item.id)}
                            className="p-1.5 px-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" /> Accept Rating
                          </button>
                          <button
                            onClick={() => handleEditClick(item)}
                            className="p-1.5 px-3 rounded-lg border border-[var(--border-med)] bg-[var(--surface)] text-[var(--text-2)] hover:bg-[var(--bg)] text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Edit Score
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* agent differences breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <div className="text-xs text-[var(--text-2)]">
                      <div className="font-semibold text-[10px] text-[var(--text-3)] uppercase tracking-widest mb-1">
                        Prosecution Argument
                      </div>
                      <p className="font-sans leading-relaxed">
                        Proposed score of <strong className="text-indigo-500">{(item.prosecution_score ?? 1.0).toFixed(1)}</strong> based on active cross-border transfer laws and structural compliance regulations.
                      </p>
                    </div>
                    <div className="text-xs text-[var(--text-2)]">
                      <div className="font-semibold text-[10px] text-[var(--text-3)] uppercase tracking-widest mb-1">
                        Defense Argument
                      </div>
                      <p className="font-sans leading-relaxed">
                        Proposed score of <strong className="text-emerald-500">{(item.defense_score ?? 0.0).toFixed(1)}</strong> citing whitelists, consent forms, contracts, and sector-wide exemptions.
                      </p>
                    </div>
                  </div>

                  {item.verbatim_quote && item.verbatim_quote !== '—' && (
                    <div className="mt-3 bg-[var(--surface)] border border-[var(--border)] p-2.5 rounded-lg text-xs italic text-[var(--text-2)] leading-relaxed font-sans">
                      "{item.verbatim_quote}"
                      <div className="text-[10px] text-[var(--text-3)] mt-1.5 font-mono not-italic uppercase tracking-wider">
                        Cited citation: {item.article_citation}
                      </div>
                    </div>
                  )}

                  <div className="mt-2.5 text-[11px] text-[var(--text-2)] flex items-center gap-1">
                    <HelpCircle className="w-3 h-3 text-[var(--text-3)] shrink-0" />
                    <span>Compliance mapping justification: <span className="font-medium">{item.mapping_rationale}</span></span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, ChevronDown, Check, X } from 'lucide-react';
import { PILLARS_REGISTRY } from '../data';
import { getIndicators, getCountries } from '../api';

interface FormProps {
  onSubmit: (country: string, pillarIds: number[] | null, indicatorIds: string[] | null, pdfUrl: string | null, llm: string) => void;
  isSubmitting: boolean;
}

const LLM_PROVIDERS = [
  { id: 'auto', name: 'Auto', cost: 'Free' },
  { id: 'minimax', name: 'MiniMax-M3 (Free)', cost: 'Free' },
  { id: 'nvidia', name: 'Nvidia Nemotron Free', cost: 'Free' },
  { id: 'gemini', name: 'Gemini', cost: '' },
  { id: 'openai', name: 'OpenAI', cost: '' },
  { id: 'grok', name: 'Grok (xAI)', cost: '' },
  { id: 'deepseek', name: 'DeepSeek', cost: '' },
  { id: 'ollama', name: 'Ollama', cost: '' },
];

interface Indicator {
  id: string;
  title: string;
  pillar_id: number;
}

function MultiSelect<T extends string | number>({
  label, options, selected, onChange, placeholder, allLabel,
}: {
  label: string;
  options: { value: T; label: string }[];
  selected: T[];
  onChange: (v: T[]) => void;
  placeholder?: string;
  allLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (v: T) => {
    onChange(selected.includes(v) ? selected.filter(s => s !== v) : [...selected, v]);
  };

  const displayText = selected.length === 0
    ? (placeholder || 'All')
    : selected.length === options.length
      ? (allLabel || `All (${options.length}) selected`)
      : `${selected.length} selected`;

  return (
    <div className="flex flex-col gap-1.5 relative" ref={ref}>
      <label className="text-[10px] font-bold text-[var(--text-3)] uppercase tracking-widest">{label}</label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full bg-[var(--bg)] border border-[var(--border-med)] rounded-lg p-2.5 text-xs font-semibold text-[var(--text)] outline-hidden flex items-center justify-between cursor-pointer hover:border-[var(--accent)] transition-all"
      >
        <span className={selected.length === 0 ? 'text-[var(--text-3)]' : ''}>{displayText}</span>
        <ChevronDown className={`w-4 h-4 text-[var(--text-3)] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-[var(--surface)] border border-[var(--border-med)] rounded-lg shadow-xl max-h-56 overflow-y-auto">
          {options.map(opt => {
            const isSel = selected.includes(opt.value);
            return (
              <label
                key={String(opt.value)}
                onClick={() => toggle(opt.value)}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-[var(--text)] hover:bg-[var(--accent-bg)] cursor-pointer transition-colors"
              >
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                  isSel ? 'bg-[var(--accent)] border-[var(--accent)]' : 'border-[var(--border-med)]'
                }`}>
                  {isSel && <Check className="w-3 h-3 text-white" />}
                </div>
                <span>{opt.label}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function NewAnalysisForm({ onSubmit, isSubmitting }: FormProps) {
  const [country, setCountry] = useState('');
  const [selectedPillars, setSelectedPillars] = useState<number[]>([]);
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>([]);
  const [llm, setLlm] = useState('auto');
  const [validationError, setValidationError] = useState('');

  const [allIndicators, setAllIndicators] = useState<Indicator[]>([]);
  const [indicatorError, setIndicatorError] = useState<string | null>(null);
  const [countryOptions, setCountryOptions] = useState<string[]>(['Singapore', 'Malaysia', 'Australia']);
  const [countryError, setCountryError] = useState<string | null>(null);

  useEffect(() => {
    getIndicators().then(([data, err]) => {
      if (data) {
        setAllIndicators(data as Indicator[]);
        setIndicatorError(null);
      } else if (err) {
        setIndicatorError(err);
      }
    });
    getCountries().then(([data, err]) => {
      if (data && (data as string[]).length > 0) {
        const merged = [...new Set([...['Singapore', 'Malaysia', 'Australia'], ...(data as string[])])];
        setCountryOptions(merged);
      }
    });
  }, []);

  const filteredIndicators = allIndicators.filter(ind => {
    if (selectedPillars.length === 0) return true;
    return selectedPillars.includes(ind.pillar_id);
  });

  const indicatorEntries = filteredIndicators.map(ind => ({
    value: ind.id,
    label: `${ind.id} — ${ind.title}`,
  }));

  const handleRunSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!country) {
      setValidationError('Please select a target country to launch document discovery.');
      return;
    }
    setValidationError('');
    onSubmit(
      country,
      selectedIndicators.length > 0 ? null : (selectedPillars.length > 0 ? selectedPillars : null),
      selectedIndicators.length > 0 ? selectedIndicators : null,
      null,
      llm,
    );
  };

  return (
    <div className="card" id="new-analysis-form">
      <div>
        <h3 className="card-title flex items-center gap-2">
          <Play className="w-4 h-4 text-[var(--accent)] fill-[var(--accent)]" />
          Queue Automated Pipeline Analysis
        </h3>
        <p className="card-desc">
          Submit an economy and choose indicators to initiate 3-tier crawler, legal parser, and LLM adversary debates.
        </p>
      </div>

      <form onSubmit={handleRunSubmit} className="mt-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          
          {/* Country list */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[var(--text-3)] uppercase tracking-widest">
              Economy / Domain
            </label>
            <div className="relative">
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-[var(--bg)] border border-[var(--border-med)] rounded-lg p-2.5 text-xs font-semibold text-[var(--text)] outline-hidden focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all appearance-none"
              >
                <option value="">Select Target Country...</option>
                {countryOptions.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[var(--text-3)] absolute right-2.5 top-3.5 pointer-events-none" />
            </div>
            {countryError && (
              <span className="text-[10px] text-amber-500 font-medium">{countryError}</span>
            )}
          </div>

          {/* Pillars Multi-Select */}
          <MultiSelect
            label="Pillars Scope"
            placeholder="All Pillars"
            allLabel="All 12 Pillars"
            options={PILLARS_REGISTRY.map(p => ({ value: p.id, label: `Pillar ${p.id} — ${p.name}` }))}
            selected={selectedPillars}
            onChange={(v) => { setSelectedPillars(v); setSelectedIndicators([]); }}
          />

          {/* LLM provider selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[var(--text-3)] uppercase tracking-widest">
              Llm Core Agent routing
            </label>
            <div className="relative">
              <select
                value={llm}
                onChange={(e) => setLlm(e.target.value)}
                className="w-full bg-[var(--bg)] border border-[var(--border-med)] rounded-lg p-2.5 text-xs font-semibold text-[var(--text)] outline-hidden focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all appearance-none"
              >
                {LLM_PROVIDERS.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[var(--text-3)] absolute right-2.5 top-3.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Indicators Multi-Select (appears below the grid) */}
        {indicatorError ? (
          <div className="text-xs text-amber-500 font-medium bg-amber-500/10 px-3 py-2 rounded-lg">
            Could not load indicators from API: {indicatorError}. Using local fallback.
          </div>
        ) : null}
        <MultiSelect
          label={`Indicators (optional — ${filteredIndicators.length} available in selected pillars)`}
          placeholder={`All indicators (${filteredIndicators.length})`}
          options={indicatorEntries}
          selected={selectedIndicators}
          onChange={setSelectedIndicators}
        />

        {/* Submit action button */}
        <div className="flex gap-3">
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileTap={{ scale: 0.98 }}
            className="flex-1 bg-[var(--accent)] hover:opacity-90 text-white p-2.5 rounded-lg text-xs font-bold tracking-wide uppercase transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 h-[38px]"
          >
            <Play className="w-3.5 h-3.5" />
            {isSubmitting ? 'Crawl & Run active...' : 'Submit Compliance Run'}
          </motion.button>
          {(selectedIndicators.length > 0 || selectedPillars.length > 0) && (
            <button
              type="button"
              onClick={() => { setSelectedPillars([]); setSelectedIndicators([]); }}
              className="px-3 text-[var(--text-3)] hover:text-[var(--text)] border border-[var(--border-med)] rounded-lg text-xs font-semibold transition-all cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <AnimatePresence>
          {validationError && (
            <motion.p
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="text-xs text-rose-500 font-semibold bg-rose-500/10 px-3 py-2 rounded-lg"
            >
              {validationError}
            </motion.p>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}

import { motion } from 'motion/react';
import { BarChart2, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { AnalysisRun } from '../types';

interface StatsProps {
  runs: AnalysisRun[];
}

export default function StatsPanel({ runs }: StatsProps) {
  const total = runs.length;
  const done = runs.filter(r => r.status === 'COMPLETE').length;
  const failed = runs.filter(r => r.status === 'FAILED').length;
  const active = runs.filter(r => ['DISCOVERING', 'ANALYSING', 'RUNNING'].includes(r.status)).length;

  const cards = [
    {
      title: 'Total Runs',
      value: total,
      sub: `${done} completed, ${active} in progress`,
      icon: BarChart2,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20 dark:bg-blue-500/5',
    },
    {
      title: 'Completed Scoring',
      value: done,
      sub: `${total > 0 ? Math.round((done / total) * 100) : 0}% success rate`,
      icon: CheckCircle2,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20 dark:bg-emerald-500/5',
    },
    {
      title: 'Active Pipeline',
      value: active,
      sub: 'Celery worker clusters online',
      icon: Clock,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20 dark:bg-amber-500/5',
    },
    {
      title: 'Failed Tasks',
      value: failed,
      sub: 'Needs human review priority',
      icon: AlertTriangle,
      color: 'text-rose-500 bg-rose-500/10 border-rose-500/20 dark:bg-rose-500/5',
    },
  ];

  return (
    <div className="stats-grid" id="stats-panel-grid">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            id={`stat-card-${idx}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: idx * 0.08, ease: 'easeOut' }}
            whileHover={{ y: -3, scale: 1.015 }}
            className="stat-card"
          >
            <div className="stat-icon-row">
              <span className="stat-label">
                {card.title}
              </span>
              <div className={`stat-icon p-2 rounded-lg border ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-1">
              <h3 className="stat-value">
                {card.value}
              </h3>
              <p className="text-xs text-[var(--text-3)] font-medium mt-1">
                {card.sub}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

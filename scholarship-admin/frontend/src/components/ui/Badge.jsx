import { AI_RESULT, MATCH_STATUS, PRIORITY, RULE_RESULT, RULE_STATUS, STATUS } from '../../config/labels';

const TONES = {
  grey: 'bg-paper text-muted border-line',
  navy: 'bg-navy-soft text-navy border-navy/20',
  ok: 'bg-ok-soft text-ok border-ok/25',
  'ok-strong': 'bg-ok text-white border-ok',
  warn: 'bg-warn-soft text-warn border-warn-line/50',
  'warn-strong': 'bg-warn-soft text-warn border-warn-line',
  bad: 'bg-bad-soft text-bad border-bad/25',
};

export function Badge({ tone = 'grey', children, className = '', title }) {
  return (
    <span title={title} className={`inline-flex items-center whitespace-nowrap rounded border px-2 py-0.5 text-[11.5px] font-semibold ${TONES[tone] || TONES.grey} ${className}`}>
      {children}
    </span>
  );
}

const fromMap = (map, key, fallback) => map[key] || { label: fallback ?? key ?? '—', tone: 'grey' };

export const StatusBadge = ({ status }) => {
  const s = fromMap(STATUS, status);
  return <Badge tone={s.tone}>{s.label}</Badge>;
};

export const PriorityBadge = ({ priority }) => {
  const p = fromMap(PRIORITY, priority || 'normal');
  return <Badge tone={p.tone}>{p.label} priority</Badge>;
};

export const AiResultBadge = ({ result }) => {
  const r = fromMap(AI_RESULT, result || 'NOT_RUN');
  return <Badge tone={r.tone}>{r.label}</Badge>;
};

export const RuleResultBadge = ({ result }) => {
  const r = fromMap(RULE_RESULT, result, 'Not evaluated');
  return <Badge tone={r.tone}>{r.label}</Badge>;
};

export const RuleStatusBadge = ({ status }) => {
  const r = fromMap(RULE_STATUS, status);
  return <Badge tone={r.tone} className="min-w-[92px] justify-center">{r.label}</Badge>;
};

export const MatchBadge = ({ status }) => {
  const r = fromMap(MATCH_STATUS, status);
  return <Badge tone={r.tone}>{r.label}</Badge>;
};

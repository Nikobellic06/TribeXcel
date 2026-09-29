import { Info, CircleCheck, TriangleAlert, CircleAlert } from 'lucide-react';

const tones = {
  info: { cls: 'border-navy/20 bg-navy-soft/70 text-ink', Icon: Info, icon: 'text-navy' },
  success: { cls: 'border-leaf/25 bg-leaf-soft text-ink', Icon: CircleCheck, icon: 'text-leaf' },
  warn: { cls: 'border-ochre/30 bg-ochre-soft text-ink', Icon: TriangleAlert, icon: 'text-ochre' },
  error: { cls: 'border-alert/25 bg-alert-soft text-ink', Icon: CircleAlert, icon: 'text-alert' },
};

export default function Alert({ tone = 'info', title, children, action, className = '' }) {
  const { cls, Icon, icon } = tones[tone];
  return (
    <div className={`flex gap-3 rounded-md border px-4 py-3 ${cls} ${className}`} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${icon}`} aria-hidden="true" />
      <div className="min-w-0 flex-1 text-[13px] leading-relaxed">
        {title && <p className="font-semibold text-ink">{title}</p>}
        {children && <div className={title ? 'mt-0.5 text-muted' : ''}>{children}</div>}
      </div>
      {action && <div className="shrink-0 self-center">{action}</div>}
    </div>
  );
}

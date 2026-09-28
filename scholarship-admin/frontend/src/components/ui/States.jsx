import { CircleAlert, Inbox, LoaderCircle, RefreshCw } from 'lucide-react';

export function Loading({ label = 'Loading…', className = 'py-12' }) {
  return (
    <div className={`flex items-center justify-center gap-2.5 text-[13px] text-muted ${className}`} role="status">
      <LoaderCircle className="h-4 w-4 animate-spin text-navy" aria-hidden="true" />
      {label}
    </div>
  );
}

export function Empty({ title = 'Nothing to show', message, action, className = 'py-12' }) {
  return (
    <div className={`flex flex-col items-center justify-center px-4 text-center ${className}`}>
      <Inbox className="h-7 w-7 text-[#a4afbd]" aria-hidden="true" />
      <p className="mt-2 text-[13.5px] font-semibold text-ink">{title}</p>
      {message && <p className="mt-0.5 max-w-md text-[12.5px] text-muted">{message}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function ErrorState({ message = 'Unable to load this information. Please try again.', onRetry, className = 'py-10' }) {
  return (
    <div className={`flex flex-col items-center justify-center px-4 text-center ${className}`} role="alert">
      <CircleAlert className="h-7 w-7 text-bad" aria-hidden="true" />
      <p className="mt-2 max-w-md text-[13px] text-ink">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="mt-3 inline-flex items-center gap-1.5 rounded border border-line bg-white px-3 py-1.5 text-[12.5px] font-semibold text-navy hover:bg-navy-soft/50">
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" /> Try again
        </button>
      )}
    </div>
  );
}

const NOTICE_TONES = {
  info: 'border-navy/20 bg-navy-soft/60',
  ok: 'border-ok/30 bg-ok-soft',
  warn: 'border-warn-line/60 bg-warn-soft',
  bad: 'border-bad/30 bg-bad-soft',
};

export function Notice({ tone = 'info', title, children, className = '' }) {
  return (
    <div className={`rounded border px-3.5 py-2.5 text-[12.5px] leading-relaxed text-ink ${NOTICE_TONES[tone]} ${className}`} role={tone === 'bad' ? 'alert' : 'status'}>
      {title && <p className="font-semibold">{title}</p>}
      {children && <div className={title ? 'mt-0.5' : ''}>{children}</div>}
    </div>
  );
}

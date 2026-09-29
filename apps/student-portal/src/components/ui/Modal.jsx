import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/* Accessible modal dialog: Escape closes, focus moves inside, page scroll is locked. */
export default function Modal({ open, onClose, title, badge, children, footer, width = 'max-w-lg', dismissable = true }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previouslyFocused = document.activeElement;
    const onKey = (e) => {
      if (e.key === 'Escape' && dismissable) onClose?.();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    const timer = setTimeout(() => {
      const focusable = panelRef.current?.querySelector('input, button:not([data-close]), select, textarea, a[href]');
      (focusable || panelRef.current)?.focus();
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      previouslyFocused?.focus?.();
    };
  }, [open, onClose, dismissable]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={typeof title === 'string' ? title : undefined}>
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        className="absolute inset-0 cursor-default bg-navy-deep/55"
        onClick={() => dismissable && onClose?.()}
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`relative flex max-h-[92vh] w-full ${width} flex-col overflow-hidden rounded-t-lg bg-white shadow-2xl sm:rounded-lg`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div className="flex min-w-0 items-center gap-2">
            <h2 className="truncate font-serif text-[17px] font-bold text-navy">{title}</h2>
            {badge}
          </div>
          {dismissable && (
            <button
              type="button"
              data-close
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted hover:bg-paper"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-line bg-paper px-5 py-3">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

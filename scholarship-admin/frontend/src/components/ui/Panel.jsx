/* A titled content panel. `id` makes it a jump target from the page index. */
export default function Panel({ id, title, subtitle, actions, children, className = '', bodyClass = 'p-4' }) {
  return (
    <section id={id} className={`scroll-mt-4 rounded border border-line bg-white ${className}`}>
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5">
          <div className="min-w-0">
            <h2 className="text-[14px] font-semibold text-ink">{title}</h2>
            {subtitle && <p className="text-[12px] text-muted">{subtitle}</p>}
          </div>
          {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={bodyClass}>{children}</div>
    </section>
  );
}

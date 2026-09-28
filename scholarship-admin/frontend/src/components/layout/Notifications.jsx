import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { getNotifications, markNotificationsSeen } from '../../api/admin';
import { formatDateTime } from '../../utils/format';
import { SCHEMES } from '../../config/labels';

const DOT = { review: 'bg-bad', document: 'bg-warn-line', correction: 'bg-navy-2', new: 'bg-ok', waiting: 'bg-muted' };

/* Notifications are derived from application data by the API (no push service). */
export default function Notifications() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const ref = useRef(null);

  const load = useCallback(() => {
    getNotifications()
      .then((d) => {
        setData(d);
        setError(false);
      })
      .catch(() => setError(true));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const esc = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) {
      load();
      if (data?.unread) markNotificationsSeen().then(() => setData((d) => (d ? { ...d, unread: 0 } : d))).catch(() => {});
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-label={`Notifications${data?.unread ? `, ${data.unread} new` : ''}`}
        className="relative flex h-9 w-9 items-center justify-center rounded text-white hover:bg-white/10"
      >
        <Bell className="h-[18px] w-[18px]" />
        {data?.unread > 0 && (
          <span className="num absolute -right-0.5 -top-0.5 min-w-[18px] rounded-full bg-bad px-1 text-center text-[10.5px] font-bold leading-[18px] text-white">
            {data.unread > 99 ? '99+' : data.unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-[340px] max-w-[92vw] overflow-hidden rounded border border-line bg-white text-ink shadow-lg">
          <div className="flex items-center justify-between border-b border-line px-3.5 py-2.5">
            <p className="text-[13px] font-semibold">Notifications</p>
            {data && <p className="text-[11.5px] text-muted">{data.total} item(s)</p>}
          </div>
          <div className="max-h-[380px] overflow-y-auto">
            {error && <p className="px-3.5 py-6 text-center text-[12.5px] text-muted">Unable to load notifications.</p>}
            {!error && data?.items?.length === 0 && <p className="px-3.5 py-6 text-center text-[12.5px] text-muted">No notifications. All applications are up to date.</p>}
            {!error &&
              data?.items?.map((n, i) => (
                <Link
                  key={`${n.applicationId}-${n.type}-${i}`}
                  to={`/application/${n.applicationId}`}
                  onClick={() => setOpen(false)}
                  className="flex gap-2.5 border-b border-line px-3.5 py-2.5 last:border-b-0 hover:bg-paper"
                >
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${DOT[n.type] || 'bg-muted'}`} aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block text-[12.5px] font-semibold">{n.title}</span>
                    <span className="block truncate text-[12px] text-muted">
                      {n.applicationCode}, {n.name}, {SCHEMES[n.scheme]?.short || n.scheme}
                    </span>
                    {n.detail && <span className="block text-[12px] text-muted">{n.detail}</span>}
                    <span className="block text-[11px] text-[#95a1b0]">{formatDateTime(n.at)}</span>
                  </span>
                </Link>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

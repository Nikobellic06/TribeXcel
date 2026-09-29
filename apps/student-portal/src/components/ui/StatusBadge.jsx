import { useLang } from '../../i18n/LanguageContext';

const styles = {
  Draft: 'bg-paper text-muted border-line',
  Pending: 'bg-navy-soft text-navy border-navy/20',
  Eligible: 'bg-leaf-soft text-leaf border-leaf/25',
  Deficient: 'bg-ochre-soft text-[#8a5a12] border-ochre/30',
  Flagged: 'bg-ochre-soft text-[#8a5a12] border-ochre/30',
  Selected: 'bg-leaf text-white border-leaf',
  Rejected: 'bg-alert-soft text-alert border-alert/25',
};

export default function StatusBadge({ status, className = '' }) {
  const { t } = useLang();
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[12px] font-semibold ${styles[status] || styles.Pending} ${className}`}
    >
      {t(`status.${status}`)}
    </span>
  );
}

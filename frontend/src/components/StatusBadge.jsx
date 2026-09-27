/**
 * StatusBadge — renders a small pill badge according to status type.
 *
 * type: 'pending' | 'eligible' | 'selected' | 'deficient' | 'flagged'
 */
const CONFIG = {
  pending:   { label: 'Pending',   classes: 'bg-blue-50   text-blue-700   border-blue-200'  },
  eligible:  { label: 'Eligible',  classes: 'bg-green-50  text-green-700  border-green-200' },
  selected:  { label: 'Selected',  classes: 'bg-green-50  text-green-700  border-green-200' },
  deficient: { label: 'Deficient', classes: 'bg-amber-50  text-amber-700  border-amber-200' },
  flagged:   { label: 'Flagged',   classes: 'bg-red-50    text-red-700    border-red-200'   },
};

export default function StatusBadge({ status }) {
  const key = status?.toLowerCase();
  const cfg = CONFIG[key] || { label: status, classes: 'bg-gray-50 text-gray-600 border-gray-200' };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${cfg.classes}`}
    >
      {cfg.label}
    </span>
  );
}

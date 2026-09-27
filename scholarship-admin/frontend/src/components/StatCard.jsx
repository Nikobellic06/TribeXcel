/**
 * Reusable stat card for dashboard summary row.
 *
 * Props:
 *   icon       – Lucide icon component
 *   value      – string|number to display prominently
 *   label      – descriptor text below the value
 *   iconBg     – Tailwind background class for icon container
 *   iconColor  – Tailwind text-color class for the icon
 */
export default function StatCard({ icon: Icon, value, label, iconBg, iconColor }) {
  return (
    <div className="flex-1 min-w-0 bg-white border border-[#dde1e7] rounded-lg p-4 flex flex-col gap-3">
      <div
        className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}
      >
        <Icon size={16} />
      </div>
      <div>
        <div className="text-2xl font-semibold text-[#1c2b3a] leading-none tracking-tight">
          {value}
        </div>
        <div className="text-xs text-[#6b7a8d] mt-1 leading-snug">{label}</div>
      </div>
    </div>
  );
}

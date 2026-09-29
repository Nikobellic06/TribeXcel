/**
 * Official Ministry of Tribal Affairs typographic branding
 * In accordance with e-Governance design guidelines, avoids fabricated emblems and uses
 * authoritative institutional typography treatment.
 */
export default function Emblem({ size = 'md' }) {
  const isSm = size === 'sm';
  return (
    <div className={`flex shrink-0 flex-col items-center justify-center border border-navy-700 bg-navy-900 text-white font-serif rounded ${isSm ? 'px-2 py-1' : 'px-2.5 py-1.5'}`}>
      <span className={`${isSm ? 'text-[9px]' : 'text-[10px]'} font-bold tracking-wider uppercase text-amber-300`}>
        भारत सरकार
      </span>
      <span className={`${isSm ? 'text-[8px]' : 'text-[9px]'} font-semibold tracking-wider text-slate-200`}>
        GOVT. OF INDIA
      </span>
    </div>
  );
}

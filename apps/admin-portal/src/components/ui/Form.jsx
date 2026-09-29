const base = 'w-full rounded border border-line bg-white px-2.5 text-[13px] text-ink placeholder:text-[#9aa6b4] focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/15';

export function Label({ htmlFor, children, required }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-[12px] font-semibold text-ink">
      {children}
      {required && <span className="ml-0.5 text-bad">*</span>}
    </label>
  );
}

export const Input = ({ className = '', ...p }) => <input className={`${base} h-9 ${className}`} {...p} />;
export const Select = ({ className = '', children, ...p }) => <select className={`${base} h-9 pr-7 ${className}`} {...p}>{children}</select>;
export const Textarea = ({ className = '', ...p }) => <textarea className={`${base} py-2 ${className}`} {...p} />;

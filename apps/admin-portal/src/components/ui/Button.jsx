import { Link } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';

const VARIANTS = {
  primary: 'bg-navy text-white border-navy hover:bg-navy-deep',
  secondary: 'bg-white text-navy border-line hover:border-navy/50 hover:bg-navy-soft/40',
  ok: 'bg-ok text-white border-ok hover:bg-[#186238]',
  warn: 'bg-white text-warn border-warn-line hover:bg-warn-soft',
  bad: 'bg-white text-bad border-bad/40 hover:bg-bad-soft',
  'bad-solid': 'bg-bad text-white border-bad hover:bg-[#931c13]',
  ghost: 'bg-transparent text-navy border-transparent hover:bg-navy-soft/60',
};
const SIZES = { sm: 'h-8 px-3 text-[12.5px] gap-1.5', md: 'h-9 px-3.5 text-[13px] gap-2', lg: 'h-10 px-5 text-[14px] gap-2' };

export default function Button({ variant = 'primary', size = 'md', to, href, icon: Icon, loading, className = '', children, type = 'button', disabled, ...rest }) {
  const cls = `inline-flex shrink-0 items-center justify-center rounded border font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-55 ${VARIANTS[variant]} ${SIZES[size]} ${className}`;
  const body = (
    <>
      {loading ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
      {children}
    </>
  );
  if (to) return <Link to={to} className={cls} {...rest}>{body}</Link>;
  if (href) return <a href={href} className={cls} {...rest}>{body}</a>;
  return <button type={type} className={cls} disabled={disabled || loading} {...rest}>{body}</button>;
}

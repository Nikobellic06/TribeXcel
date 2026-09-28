import { Link } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';

const variants = {
  primary: 'bg-navy text-white hover:bg-navy-deep border border-navy',
  secondary: 'bg-white text-navy border border-navy/30 hover:border-navy hover:bg-navy-soft/50',
  ghost: 'bg-transparent text-navy border border-transparent hover:bg-navy-soft/60',
  success: 'bg-leaf text-white border border-leaf hover:bg-[#17603a]',
  danger: 'bg-white text-alert border border-alert/40 hover:bg-alert-soft',
};

const sizes = {
  sm: 'h-9 px-3 text-[13px] gap-1.5',
  md: 'h-11 px-4 text-[14px] gap-2',
  lg: 'h-12 px-6 text-[15px] gap-2',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  to,
  href,
  loading = false,
  icon: Icon,
  iconRight: IconRight,
  className = '',
  children,
  disabled,
  type = 'button',
  ...rest
}) {
  const cls = `inline-flex items-center justify-center rounded-md font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`;
  const content = (
    <>
      {loading ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
      {children}
      {IconRight && !loading && <IconRight className="h-4 w-4" aria-hidden="true" />}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={cls} {...rest}>
        {content}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={cls} {...rest}>
        {content}
      </a>
    );
  }
  return (
    <button type={type} className={cls} disabled={disabled || loading} {...rest}>
      {content}
    </button>
  );
}

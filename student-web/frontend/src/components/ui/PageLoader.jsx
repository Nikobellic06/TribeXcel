import { LoaderCircle } from 'lucide-react';

export default function PageLoader({ label = 'Loading…', full = false }) {
  return (
    <div className={`flex items-center justify-center gap-3 text-muted ${full ? 'min-h-screen' : 'py-24'}`} role="status">
      <LoaderCircle className="h-5 w-5 animate-spin text-navy" aria-hidden="true" />
      <span className="text-[14px]">{label}</span>
    </div>
  );
}

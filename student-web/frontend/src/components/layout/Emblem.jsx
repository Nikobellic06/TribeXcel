import { Landmark } from 'lucide-react';

/* Portal mark used in headers. Replace with the official emblem asset if provided. */
export default function Emblem({ size = 'md' }) {
  const box = size === 'sm' ? 'h-10 w-10' : 'h-12 w-12 sm:h-14 sm:w-14';
  const icon = size === 'sm' ? 'h-5 w-5' : 'h-6 w-6 sm:h-7 sm:w-7';
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-full bg-navy ring-2 ring-[#d9a441]/60 ring-offset-2 ${box}`}>
      <Landmark className={`${icon} text-white`} aria-hidden="true" />
    </span>
  );
}

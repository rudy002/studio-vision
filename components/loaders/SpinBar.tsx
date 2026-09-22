import { cn } from '@/lib/utils';

type Size = 'sm' | 'md' | 'lg';

const trackW: Record<Size, string> = { sm: '42px', md: '64px', lg: '96px' };
const indicW: Record<Size, string> = { sm: '14px', md: '21px', lg: '32px' };

interface SpinBarProps {
  size?: Size;
  className?: string;
  /** Libellé lu par les lecteurs d'écran */
  label?: string;
}

export function SpinBar({ size = 'md', className, label = 'Chargement' }: SpinBarProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn('spin-atom inline-flex items-center', className)}
    >
      <span
        className="relative overflow-hidden rounded-full block"
        style={{ width: trackW[size], height: '1px', background: 'rgba(255,255,255,0.25)' }}
      >
        <span
          className="absolute inset-y-0 left-0 rounded-full bg-gold"
          style={{
            width: indicW[size],
            animation: 'spin-bar-slide 1.4s cubic-bezier(0.4,0,0.2,1) infinite',
          }}
        />
      </span>
    </span>
  );
}

export default SpinBar;

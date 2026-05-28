import { cn } from '@/lib/utils';

type Size = 'sm' | 'md' | 'lg';

const dimsCls: Record<Size, string> = {
  sm: 'w-3.5 h-3.5',
  md: 'w-[22px] h-[22px]',
  lg: 'w-8 h-8',
};

const borderW: Record<Size, string> = {
  sm: '1px',
  md: '1px',
  lg: '1.5px',
};

interface SpinRingProps {
  size?: Size;
  light?: boolean;
  className?: string;
}

export function SpinRing({ size = 'md', light = false, className }: SpinRingProps) {
  const track = light ? '#d4cdc4' : 'rgba(255,255,255,0.15)';
  return (
    <span
      role="status"
      aria-label="Chargement"
      className={cn('spin-atom inline-flex items-center justify-center shrink-0', className)}
    >
      <span
        className={cn('rounded-full', dimsCls[size])}
        style={{
          border: `${borderW[size]} solid ${track}`,
          borderTopColor: '#b08d57',
          animation: 'spin-ring 0.9s linear infinite',
        }}
      />
    </span>
  );
}

export default SpinRing;

import { cn } from '@/lib/utils';

type Size = 'sm' | 'md' | 'lg';

const dotPx: Record<Size, number> = { sm: 4, md: 5, lg: 7 };

interface SpinDotsProps {
  size?: Size;
  className?: string;
}

export function SpinDots({ size = 'md', className }: SpinDotsProps) {
  const px = dotPx[size];
  return (
    <span
      role="status"
      aria-label="Chargement"
      className={cn('spin-atom inline-flex items-center gap-1.5', className)}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="rounded-full shrink-0 bg-[#b08d57]"
          style={{
            width: px,
            height: px,
            animation: 'spin-dot 1.2s ease-in-out infinite',
            animationDelay: `${i * 0.18}s`,
          }}
        />
      ))}
    </span>
  );
}

export default SpinDots;

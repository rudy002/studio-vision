import { cn } from '@/lib/utils';

type Size = 'sm' | 'md' | 'lg';

const sizePx: Record<Size, number> = { sm: 16, md: 24, lg: 32 };

interface SpinIrisProps {
  size?: Size;
  className?: string;
}

export function SpinIris({ size = 'md', className }: SpinIrisProps) {
  const px = sizePx[size];
  const c = px / 2;
  // Blade: narrow triangle from center toward outer edge, 4 px wide at tip
  const halfBase = px * 0.083; // ~2px at md
  const outer = px * 0.083;    // distance from edge

  const blades = Array.from({ length: 6 }, (_, i) => (
    <polygon
      key={i}
      points={`${c},${c} ${c - halfBase * 1.5},${outer} ${c + halfBase * 1.5},${outer}`}
      fill="#b08d57"
      transform={`rotate(${i * 60}, ${c}, ${c})`}
      opacity={0.55 + i * 0.075}
    />
  ));

  return (
    <span
      role="status"
      aria-label="Chargement"
      className={cn('spin-atom inline-flex items-center justify-center shrink-0', className)}
    >
      <svg
        width={px}
        height={px}
        viewBox={`0 0 ${px} ${px}`}
        aria-hidden="true"
        style={{ animation: 'spin-iris 1.6s cubic-bezier(0.65,0,0.35,1) infinite alternate' }}
      >
        {blades}
      </svg>
    </span>
  );
}

export default SpinIris;

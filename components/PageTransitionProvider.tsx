'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
  CSSProperties,
} from 'react';
import { useRouter, usePathname } from 'next/navigation';

type NavigateFn = (href: string) => void;
const TransitionCtx = createContext<NavigateFn>(() => {});

export function usePageTransition(): NavigateFn {
  return useContext(TransitionCtx);
}

type Phase = 'idle' | 'entering' | 'navigating' | 'leaving';

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const router    = useRouter();
  const pathname  = usePathname();
  const [phase, setPhase] = useState<Phase>('idle');

  const pendingHref    = useRef<string | null>(null);
  const prevPathname   = useRef(pathname);
  const waitingForNav  = useRef(false);

  // When the route actually changes, switch to 'leaving'
  useEffect(() => {
    if (waitingForNav.current && pathname !== prevPathname.current) {
      prevPathname.current = pathname;
      waitingForNav.current = false;
      // One rAF so the new page has a chance to paint first
      requestAnimationFrame(() => setPhase('leaving'));
    }
  }, [pathname]);

  const navigate = useCallback(
    (href: string) => {
      if (phase !== 'idle') return;
      if (href === pathname)  return;
      pendingHref.current = href;
      setPhase('entering');
    },
    [phase, pathname],
  );

  const handleAnimEnd = useCallback(() => {
    if (phase === 'entering') {
      // Curtain is fully closed — now navigate
      setPhase('navigating');
      waitingForNav.current = true;
      prevPathname.current  = pathname;
      router.push(pendingHref.current!);
      pendingHref.current = null;
    } else if (phase === 'leaving') {
      setPhase('idle');
    }
  }, [phase, pathname, router]);

  const overlayStyle: CSSProperties =
    phase === 'entering'   ? { animation: 'loader-in  0.15s ease-out forwards' } :
    phase === 'navigating' ? { opacity: 1 } :
    phase === 'leaving'    ? { animation: 'loader-out 0.3s ease-in  forwards' } :
    {};

  return (
    <TransitionCtx.Provider value={navigate}>
      {children}

      {phase !== 'idle' && (
        <div
          key={phase}
          className="page-loader fixed inset-0 z-200 flex items-center justify-center"
          style={{ background: 'rgba(10,15,26,0.85)', backdropFilter: 'blur(6px)', ...overlayStyle }}
          onAnimationEnd={phase !== 'navigating' ? handleAnimEnd : undefined}
          aria-hidden="true"
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: '1.5px solid rgba(195,149,83,0.2)',
              borderTopColor: '#b08d57',
              animation: 'spin-ring 0.75s linear infinite',
            }}
          />
        </div>
      )}
    </TransitionCtx.Provider>
  );
}

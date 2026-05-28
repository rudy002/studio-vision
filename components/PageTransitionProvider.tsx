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

  // Inline style per phase — using key={phase} remounts the div so
  // the CSS animation always restarts cleanly from its `from` keyframe.
  const overlayStyle: CSSProperties =
    phase === 'entering'   ? { animation: 'curtain-in  0.22s ease-in  forwards' } :
    phase === 'navigating' ? { transform: 'translateX(0%)' } :
    phase === 'leaving'    ? { animation: 'curtain-out 0.22s ease-out forwards' } :
    {};

  return (
    <TransitionCtx.Provider value={navigate}>
      {children}

      {phase !== 'idle' && (
        <div
          key={phase}
          className="page-curtain fixed inset-0 z-[200] bg-[#0a0f1a] will-change-transform"
          style={overlayStyle}
          onAnimationEnd={phase !== 'navigating' ? handleAnimEnd : undefined}
          aria-hidden="true"
        />
      )}
    </TransitionCtx.Provider>
  );
}

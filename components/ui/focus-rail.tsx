"use client";

import * as React from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type FocusRailItem = {
  id: string | number;
  title: string;
  description?: string;
  imageSrc: string;
  href?: string;
  meta?: string;
};

interface FocusRailProps {
  items: FocusRailItem[];
  initialIndex?: number;
  loop?: boolean;
  autoPlay?: boolean;
  interval?: number;
  className?: string;
  ctaLabel?: string;
}

function wrap(min: number, max: number, v: number) {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
}

const BASE_SPRING = { type: "spring", stiffness: 300, damping: 30, mass: 1 } as const;
const TAP_SPRING  = { type: "spring", stiffness: 450, damping: 18, mass: 1 } as const;

export function FocusRail({
  items,
  initialIndex = 0,
  loop = true,
  autoPlay = false,
  interval = 4000,
  className,
  ctaLabel = "Voir le bien",
}: FocusRailProps) {
  const [active, setActive] = React.useState(initialIndex);
  const [isHovering, setIsHovering] = React.useState(false);
  const lastWheelTime = React.useRef<number>(0);

  const count = items.length;
  const activeIndex = wrap(0, count, active);
  const activeItem = items[activeIndex];

  const handlePrev = React.useCallback(() => {
    if (!loop && active === 0) return;
    setActive((p) => p - 1);
  }, [loop, active]);

  const handleNext = React.useCallback(() => {
    if (!loop && active === count - 1) return;
    setActive((p) => p + 1);
  }, [loop, active, count]);

  const onWheel = React.useCallback(
    (e: React.WheelEvent) => {
      const now = Date.now();
      if (now - lastWheelTime.current < 400) return;
      const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      const delta = isHorizontal ? e.deltaX : e.deltaY;
      if (Math.abs(delta) > 20) {
        delta > 0 ? handleNext() : handlePrev();
        lastWheelTime.current = now;
      }
    },
    [handleNext, handlePrev]
  );

  React.useEffect(() => {
    if (!autoPlay || isHovering) return;
    const timer = setInterval(handleNext, interval);
    return () => clearInterval(timer);
  }, [autoPlay, isHovering, handleNext, interval]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") handlePrev();
    if (e.key === "ArrowRight") handleNext();
  };

  const swipePower = (offset: number, velocity: number) =>
    Math.abs(offset) * velocity;

  const onDragEnd = (
    _e: MouseEvent | TouchEvent | PointerEvent,
    { offset, velocity }: PanInfo
  ) => {
    const swipe = swipePower(offset.x, velocity.x);
    if (swipe < -10000) handleNext();
    else if (swipe > 10000) handlePrev();
  };

  const visibleIndices = [-2, -1, 0, 1, 2];

  return (
    <div
      className={cn(
        "group relative flex h-150 w-full flex-col overflow-hidden text-white outline-none select-none overflow-x-hidden",
        className
      )}
      style={{ background: '#0e1612' }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onWheel={onWheel}
    >
      {/* Background ambience — image active floutée */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={`bg-${activeItem.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <img
              src={activeItem.imageSrc}
              alt=""
              className="h-full w-full object-cover blur-3xl saturate-150"
            />
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(to top, #0e1612 0%, rgba(14,22,18,0.55) 50%, transparent 100%)'
            }} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Rail */}
      <div className="relative z-10 flex flex-1 flex-col justify-center px-4 md:px-8">
        <motion.div
          className="relative mx-auto flex h-90 w-full max-w-6xl items-center justify-center cursor-grab active:cursor-grabbing"
          style={{ perspective: '1200px' }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={onDragEnd}
        >
          {visibleIndices.map((offset) => {
            const absIndex = active + offset;
            const index = wrap(0, count, absIndex);
            const item = items[index];

            if (!loop && (absIndex < 0 || absIndex >= count)) return null;

            const isCenter = offset === 0;
            const dist = Math.abs(offset);

            return (
              <motion.div
                key={absIndex}
                className={cn(
                  "absolute aspect-3/4 w-55 md:w-70 rounded-2xl bg-[#142019] shadow-2xl",
                  isCenter ? "z-20" : "z-10"
                )}
                style={{
                  borderTop: '1px solid rgba(195,149,83,0.2)',
                  transformStyle: "preserve-3d",
                }}
                initial={false}
                animate={{
                  x:        offset * 300,
                  z:        -dist * 180,
                  scale:    isCenter ? 1 : 0.85,
                  rotateY:  offset * -20,
                  opacity:  isCenter ? 1 : Math.max(0.1, 1 - dist * 0.5),
                  filter:   `blur(${isCenter ? 0 : dist * 6}px) brightness(${isCenter ? 1 : 0.5})`,
                }}
                transition={{ scale: TAP_SPRING, default: BASE_SPRING }}
                onClick={() => {
                  if (offset !== 0) setActive((p) => p + offset);
                }}
              >
                <img
                  src={item.imageSrc}
                  alt={item.title}
                  className="h-full w-full rounded-2xl object-cover pointer-events-none"
                />
                <div className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{ background: 'linear-gradient(to bottom, rgba(195,149,83,0.08), transparent)' }}
                />
                <div className="absolute inset-0 rounded-2xl bg-black/10 pointer-events-none mix-blend-multiply" />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Info + contrôles */}
        <div className="mx-auto mt-10 flex w-full max-w-4xl flex-col items-center justify-between gap-6 md:flex-row pointer-events-auto">
          {/* Titre / meta */}
          <div className="flex flex-1 flex-col items-center text-center md:items-start md:text-left h-28 justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeItem.id}
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0,  filter: "blur(0px)" }}
                exit={{   opacity: 0, y: -10, filter: "blur(4px)" }}
                transition={{ duration: 0.3 }}
                className="space-y-1"
              >
                {activeItem.meta && (
                  <span className="text-[10px] font-medium uppercase tracking-[0.35em]"
                    style={{ color: '#c39553' }}>
                    {activeItem.meta}
                  </span>
                )}
                <h2 className="text-2xl font-light tracking-tight md:text-3xl text-white"
                  style={{ fontFamily: 'var(--font-serif, "Cormorant Garamond", serif)' }}>
                  {activeItem.title}
                </h2>
                {activeItem.description && (
                  <p className="max-w-md text-sm" style={{ color: 'rgba(239,231,214,0.55)' }}>
                    {activeItem.description}
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Boutons nav + CTA */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 rounded-full p-1 backdrop-blur-md"
              style={{ background: 'rgba(20,32,25,0.8)', border: '1px solid rgba(195,149,83,0.2)' }}>
              <button
                onClick={handlePrev}
                className="rounded-full p-3 transition hover:bg-white/10 active:scale-95"
                style={{ color: 'rgba(239,231,214,0.5)' }}
                aria-label="Précédent"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="min-w-10 text-center text-xs font-mono"
                style={{ color: 'rgba(195,149,83,0.6)' }}>
                {activeIndex + 1} / {count}
              </span>
              <button
                onClick={handleNext}
                className="rounded-full p-3 transition hover:bg-white/10 active:scale-95"
                style={{ color: 'rgba(239,231,214,0.5)' }}
                aria-label="Suivant"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {activeItem.href && (
              <Link
                href={activeItem.href}
                className="group flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition-transform hover:scale-105 active:scale-95"
                style={{
                  background: '#c39553',
                  color: '#0e1612',
                  fontFamily: 'var(--font-sans, sans-serif)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  fontSize: '11px',
                }}
              >
                {ctaLabel}
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

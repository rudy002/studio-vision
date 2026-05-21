'use client';

import * as React from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { cn } from "@/lib/utils";

export type CarouselMediaItem =
  | { type: 'photo'; url: string }
  | { type: 'video'; url: string };

interface MediaCarouselProps {
  items: CarouselMediaItem[];
  className?: string;
}

export function MediaCarousel({ items, className }: MediaCarouselProps) {
  const [page, setPage] = React.useState(0);
  const count = items.length;

  const prev = () => setPage(p => (p - 1 + count) % count);
  const next = () => setPage(p => (p + 1) % count);

  if (count === 0) {
    return (
      <div
        className={cn("flex items-center justify-center bg-black", className)}
        style={{ height: '100%' }}
      >
        <p className="text-white/20 text-[10px] tracking-[4px] uppercase">Aucun média</p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col", className)} style={{ height: '100%' }}>

      {/* ── Main viewport ── */}
      <div className="relative bg-black overflow-hidden" style={{ flex: 1, minHeight: 0 }}>

        {/*
          Sliding track: all items sit side-by-side in a flex row.
          translateX moves the whole track — no scroll container, no overflow issues.
          Items use position:absolute + inset:0 so they fill the container exactly.
        */}
        <div
          className="flex h-full transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${page * 100}%)`, height: '100%' }}
        >
          {items.map((item, i) => (
            <div
              key={i}
              className="relative shrink-0 w-full"
              style={{ height: '100%' }}
            >
              {item.type === 'video' ? (
                <>
                  {/* Blurred ambient fill behind the letterbox */}
                  <video
                    src={item.url}
                    muted autoPlay loop playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-20 blur-3xl scale-110 pointer-events-none"
                  />
                  {/* Actual video — object-contain so it never overflows */}
                  <video
                    src={item.url}
                    controls playsInline
                    className="absolute inset-0 w-full h-full object-contain z-10"
                    style={{ maxHeight: '100%' }}
                  />
                </>
              ) : (
                <>
                  {/* Blurred ambient fill — same CSS image, no extra network request */}
                  <div
                    className="absolute inset-0 scale-110"
                    style={{
                      backgroundImage: `url(${item.url})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      filter: 'blur(28px) brightness(0.22)',
                    }}
                  />
                  {/* Full image, never cropped */}
                  <img
                    src={item.url}
                    alt={`Photo ${i + 1}`}
                    className="absolute inset-0 w-full h-full object-contain z-10"
                  />
                </>
              )}
            </div>
          ))}
        </div>

        {/* Arrows */}
        {count > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-white/15 active:scale-95 focus:outline-none"
              style={{
                background: 'rgba(6,9,12,0.68)',
                border: '1px solid rgba(255,255,255,0.14)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <ChevronLeft className="h-5 w-5 text-white" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-white/15 active:scale-95 focus:outline-none"
              style={{
                background: 'rgba(6,9,12,0.68)',
                border: '1px solid rgba(255,255,255,0.14)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <ChevronRight className="h-5 w-5 text-white" />
            </button>
          </>
        )}

        {/* Counter */}
        {count > 1 && (
          <div
            className="absolute bottom-3 right-4 z-20 px-2.5 py-1 rounded-full text-[9px] tracking-[2px] text-white/55 font-mono tabular-nums pointer-events-none"
            style={{ background: 'rgba(6,9,12,0.6)', backdropFilter: 'blur(8px)' }}
          >
            {page + 1} / {count}
          </div>
        )}
      </div>

      {/* ── Dots — mobile only ── */}
      {count > 1 && (
        <div
          className="md:hidden shrink-0 flex justify-center items-center gap-1.5 py-3"
          style={{ background: 'rgba(5,7,10,0.97)', borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={cn(
                "rounded-full transition-all duration-200 focus:outline-none",
                i === page ? "w-4 h-1.5 bg-[#c39553]" : "w-1.5 h-1.5 bg-white/25 hover:bg-white/45"
              )}
            />
          ))}
        </div>
      )}

      {/* ── Thumbnail strip — desktop only ── */}
      {count > 1 && (
        <div
          className="hidden md:flex shrink-0 gap-2.5 px-4 py-3 overflow-x-auto"
          style={{
            background: 'rgba(5,7,10,0.97)',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={cn(
                "shrink-0 w-24 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 focus:outline-none",
                i === page
                  ? "border-[#c39553] opacity-100"
                  : "border-transparent opacity-40 hover:opacity-70"
              )}
            >
              {item.type === 'video' ? (
                <div className="relative w-full h-full bg-black">
                  <video src={item.url} muted className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play className="h-3 w-3 text-white fill-white" />
                  </div>
                </div>
              ) : (
                <img src={item.url} alt="" className="w-full h-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

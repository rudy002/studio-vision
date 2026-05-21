'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface CarouselItem {
  src: string;
  alt: string;
  href: string;
}

interface PropertyCarouselProps {
  items: CarouselItem[];
}

export function PropertyCarousel({ items }: PropertyCarouselProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = React.useState(
    Math.floor(items.length / 2)
  );

  const handleNext = React.useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  React.useEffect(() => {
    const timer = setInterval(handleNext, 4000);
    return () => clearInterval(timer);
  }, [handleNext]);

  const handleCardClick = (index: number, pos: number) => {
    if (pos === 0) {
      router.push(items[index].href);
    } else {
      setCurrentIndex(index);
    }
  };

  return (
    <div className="relative w-full h-[380px] md:h-[460px] flex items-center justify-center">
      {/* 3D carousel */}
      <div className="relative w-full h-full flex items-center justify-center [perspective:1200px]">
        {items.map((item, index) => {
          const total = items.length;
          let pos = ((index - currentIndex) + total) % total;
          if (pos > Math.floor(total / 2)) pos -= total;

          const isCenter   = pos === 0;
          const isAdjacent = Math.abs(pos) === 1;
          const isVisible  = Math.abs(pos) <= 1;

          return (
            <div
              key={index}
              onClick={() => handleCardClick(index, pos)}
              className="absolute w-44 h-72 md:w-60 md:h-[380px] transition-all duration-500 ease-in-out cursor-pointer"
              style={{
                transform: `translateX(${pos * 46}%) scale(${isCenter ? 1 : isAdjacent ? 0.82 : 0.68}) rotateY(${pos * -10}deg)`,
                zIndex:    isCenter ? 10 : isAdjacent ? 5 : 1,
                opacity:   isCenter ? 1  : isAdjacent ? 0.45 : 0,
                filter:    isCenter ? 'none' : 'blur(3px)',
                visibility: isVisible ? 'visible' : 'hidden',
              }}
            >
              <img
                src={item.src}
                alt={item.alt}
                className="object-cover w-full h-full rounded-2xl shadow-2xl"
                style={{
                  border: isCenter
                    ? '1.5px solid rgba(195,149,83,0.6)'
                    : '1px solid rgba(255,255,255,0.08)',
                }}
              />
              {isCenter && (
                <div className="absolute bottom-4 inset-x-0 flex justify-center">
                  <span className="text-[9px] tracking-[3px] uppercase text-[#c39553] bg-[#0e1612]/80 backdrop-blur-sm px-3 py-1 rounded-full">
                    Voir le bien →
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Prev */}
      <button
        onClick={handlePrev}
        className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-colors"
        style={{
          background: 'rgba(14,22,18,0.7)',
          border: '1px solid rgba(195,149,83,0.35)',
          backdropFilter: 'blur(8px)',
          color: '#c39553',
        }}
        aria-label="Précédent"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Next */}
      <button
        onClick={handleNext}
        className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-colors"
        style={{
          background: 'rgba(14,22,18,0.7)',
          border: '1px solid rgba(195,149,83,0.35)',
          backdropFilter: 'blur(8px)',
          color: '#c39553',
        }}
        aria-label="Suivant"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className="transition-all duration-300"
            style={{
              width:  i === currentIndex ? '24px' : '6px',
              height: '6px',
              borderRadius: '999px',
              background: i === currentIndex ? '#c39553' : 'rgba(195,149,83,0.3)',
            }}
            aria-label={`Aller au bien ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

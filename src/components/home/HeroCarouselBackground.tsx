"use client";

import * as React from "react";
import Image from "next/image";

interface HeroCarouselBackgroundProps {
  bannerImages?: string[];
}

const DEFAULT_SLIDES = [
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1920&q=80",
];

export function HeroCarouselBackground({ bannerImages }: HeroCarouselBackgroundProps) {
  const images = (bannerImages && bannerImages.length > 0) ? bannerImages : DEFAULT_SLIDES;
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);

  React.useEffect(() => {
    if (images.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [images.length, isPaused]);

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-hidden="true"
    >
      {/* Background Image Slides with Smooth Crossfade */}
      {images.map((img, idx) => {
        const isActive = idx === currentIndex;
        return (
          <div
            key={img + idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-35 scale-100" : "opacity-0 scale-105"
            } transition-transform duration-10000 ease-out`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img}
              alt="Campus and Association Activities"
              className="w-full h-full object-cover object-center"
            />
          </div>
        );
      })}

      {/* Layered Gradient Masks for Perfect Readability and High Polish */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FBF9F5]/90 via-[#FBF9F5]/80 to-[#FBF9F5]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,249,245,0.4)_0%,rgba(251,249,245,0.95)_100%)]" />

      {/* Subtle Bottom Indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 pointer-events-auto">
          {images.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? "w-6 bg-[#7B2D26]"
                  : "w-1.5 bg-[#CBD5E1] hover:bg-[#94A3B8]"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { motion, useTransform, useScroll } from "framer-motion";
import { useRef, useState, useLayoutEffect, ReactNode, useEffect } from "react";

interface HorizontalScrollSectionProps {
  children: ReactNode[] | ReactNode;
  header: ReactNode;
}

export const HorizontalScrollSection = ({ children, header }: HorizontalScrollSectionProps) => {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [isStacked, setIsStacked] = useState(false);

  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  const [carouselWidth, setCarouselWidth] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(0);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1024px)");
    const handleChange = () => setIsStacked(mediaQuery.matches);
    handleChange();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  useLayoutEffect(() => {
    const carousel = carouselRef.current;
    const viewport = viewportRef.current;
    if (!carousel || !viewport) return;

    let frameId: number | null = null;
    const updateWidths = () => {
      const nextCarouselWidth = carousel.scrollWidth;
      const nextViewportWidth = viewport.offsetWidth;
      setCarouselWidth((prev) => (prev === nextCarouselWidth ? prev : nextCarouselWidth));
      setViewportWidth((prev) => (prev === nextViewportWidth ? prev : nextViewportWidth));
    };

    const onResize = () => {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(updateWidths);
    };

    updateWidths();
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(carousel);
    resizeObserver.observe(viewport);
    window.addEventListener("resize", onResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", onResize);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [children]);

  const scrollDistance = Math.max(0, carouselWidth - viewportWidth);
  const x = useTransform(scrollYProgress, [0, 1], [0, -scrollDistance]);

  const height = `calc(100vh + ${scrollDistance}px)`;

  if (isStacked) {
    return (
      <section className="relative py-16">
        <div className="container mx-auto px-4 sm:px-6">
          {header}
          <div className="mt-4 sm:mt-6 grid gap-6 px-1 sm:px-2">
            {children}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={targetRef} className="relative" style={{ height }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 h-full flex flex-col gap-6">
          {header}
          <div ref={viewportRef} className="flex items-start flex-grow pt-2 pb-6 px-1 sm:px-2 md:px-3">
            <motion.div ref={carouselRef} style={{ x }} className="flex gap-8">
              {children}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

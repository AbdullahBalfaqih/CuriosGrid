"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useInView } from "framer-motion";
import type { MotionValue } from "framer-motion";

type CountUpProps = {
  value: number;
  className?: string;
  suffix?: string;
  duration?: number;
};

export const CountUp = ({ value, className, suffix = "", duration = 2 }: CountUpProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView && ref.current) {
      const controls = animate(0, value, {
        duration: duration,
        onUpdate(value) {
          if(ref.current) {
            ref.current.textContent = Math.round(value).toString();
          }
        },
      });
      return () => controls.stop();
    }
  }, [isInView, value, duration]);

  return (
    <span className={className}>
      <span ref={ref}>0</span>
      {suffix}
    </span>
  );
};

    
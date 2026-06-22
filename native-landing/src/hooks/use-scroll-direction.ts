"use client";

import { useEffect, useRef, useState } from "react";

const MIN_DELTA = 8;

export function useScrollDirection(threshold = 24) {
  const [visible, setVisible] = useState(true);
  const lastY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const getScrollY = () =>
      window.scrollY ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;

    lastY.current = getScrollY();

    const update = () => {
      ticking.current = false;
      const y = getScrollY();
      const delta = y - lastY.current;

      if (Math.abs(delta) < MIN_DELTA) {
        return;
      }

      if (y <= threshold) {
        setVisible(true);
      } else if (delta > 0) {
        setVisible(false);
      } else {
        setVisible(true);
      }

      lastY.current = y;
    };

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return visible;
}

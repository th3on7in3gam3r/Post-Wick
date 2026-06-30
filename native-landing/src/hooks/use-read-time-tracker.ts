"use client";

import { type RefObject, useEffect, useMemo, useState } from "react";

const WORDS_PER_MINUTE = 220;

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function useReadTimeTracker(
  articleRef: RefObject<HTMLElement | null>,
  plainText: string,
) {
  const [progress, setProgress] = useState(0);
  const readMinutes = useMemo(
    () => Math.max(1, Math.ceil(countWords(plainText) / WORDS_PER_MINUTE)),
    [plainText],
  );

  useEffect(() => {
    const article = articleRef.current;
    if (!article) return;

    const updateProgress = () => {
      const rect = article.getBoundingClientRect();
      const articleTop = window.scrollY + rect.top;
      const articleHeight = article.offsetHeight;
      const viewportAnchor = window.scrollY + window.innerHeight * 0.35;
      const traveled = viewportAnchor - articleTop;
      const next = articleHeight > 0 ? (traveled / articleHeight) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, next)));
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, [articleRef]);

  return { progress, readMinutes };
}

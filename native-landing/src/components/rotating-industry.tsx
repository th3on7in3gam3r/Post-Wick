"use client";

import { motion, useAnimationControls } from "framer-motion";
import { useEffect, useState } from "react";

const industries = [
  "sauna makers",
  "yoga studios",
  "coffee roasters",
  "design agencies",
  "boutique hotels",
];

type TypingTextProps = {
  words?: string[];
  typingSpeed?: number;
  deleteSpeed?: number;
  delayBetweenWords?: number;
};

function TypingText({
  words = industries,
  typingSpeed = 80,
  deleteSpeed = 45,
  delayBetweenWords = 1800,
}: TypingTextProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState(words[0] ?? "");
  const [isDeleting, setIsDeleting] = useState(false);
  const controls = useAnimationControls();

  useEffect(() => {
    const word = words[currentWordIndex];

    if (isDeleting) {
      if (currentText === "") {
        setIsDeleting(false);
        setCurrentWordIndex((prev) => (prev + 1) % words.length);
        return;
      }

      const timer = setTimeout(() => {
        setCurrentText(word.substring(0, currentText.length - 1));
      }, deleteSpeed);
      return () => clearTimeout(timer);
    }

    if (currentText === word) {
      const timer = setTimeout(() => {
        setIsDeleting(true);
      }, delayBetweenWords);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setCurrentText(word.substring(0, currentText.length + 1));
    }, typingSpeed);
    return () => clearTimeout(timer);
  }, [
    currentText,
    currentWordIndex,
    isDeleting,
    words,
    typingSpeed,
    deleteSpeed,
    delayBetweenWords,
  ]);

  useEffect(() => {
    controls.start({
      opacity: [1, 0.2],
      transition: {
        duration: 0.55,
        repeat: Infinity,
        repeatType: "reverse",
      },
    });
  }, [controls]);

  return (
    <span
      className="inline-block italic text-gold text-center"
      aria-live="polite"
    >
      {currentText}
      <motion.span animate={controls} className="ml-0.5 font-light text-gold">
        |
      </motion.span>
    </span>
  );
}

export function RotatingIndustry() {
  return <TypingText />;
}

"use client";

import { useSprings, animated, SpringValue } from "@react-spring/web";
import { useEffect, useRef } from "react";

interface SplitTextProps {
  text?: string;
  className?: string;
  delay?: number;
  animationFrom?: { opacity: number; transform: string };
  animationTo?: { opacity: number; transform: string };
  easing?: (t: number) => number;
  textAlign?: "left" | "right" | "center" | "justify" | "initial" | "inherit";
  onAnimationComplete?: () => void;
  isArabic?: boolean;
  trigger?: boolean;
}

const SplitText: React.FC<SplitTextProps> = ({
  text = "",
  className = "",
  delay = 50,
  animationFrom = { opacity: 0, transform: "translate3d(0,40px,0)" },
  animationTo = { opacity: 1, transform: "translate3d(0,0,0)" },
  easing = (t) => t,
  textAlign = "center",
  onAnimationComplete,
  isArabic = false,
  trigger = false,
}) => {
  const unitsToAnimate = isArabic 
    ? text.split(" ") 
    : text.split("");

  const animatedCount = useRef(0);
  const prevTrigger = useRef(trigger);

  useEffect(() => {
    if ((prevTrigger.current && !trigger) || (trigger && text !== unitsToAnimate.join(isArabic ? " " : ""))) {
      animatedCount.current = 0;
    }
    prevTrigger.current = trigger;
  }, [trigger, text, unitsToAnimate, isArabic]);

  const springs = useSprings(
    unitsToAnimate.length,
    unitsToAnimate.map((_, i) => ({
      from: animationFrom,
      to: trigger
        ? async (next: (step: Record<string, any>) => Promise<void>) => {
            await next(animationTo);
            animatedCount.current += 1;
            if (
              animatedCount.current === unitsToAnimate.length &&
              onAnimationComplete
            ) {
              onAnimationComplete();
            }
          }
        : animationFrom,
      delay: trigger ? i * delay : 0,
      config: { tension: 170, friction: 26, easing },
      reset: !trigger || (trigger && text !== unitsToAnimate.join(isArabic ? " " : "")) ,
    }))
  );

  return (
    <p
      className={`split-parent ${className}`}
      style={{
        textAlign: textAlign,
        whiteSpace: "pre-wrap",
        wordBreak: isArabic ? "normal" : "break-all",
      }}
    >
      {unitsToAnimate.map((unit, idx) => (
        <animated.span
          key={idx}
          style={{
            ...springs[idx],
            display: "inline-block",
            marginRight: isArabic && idx < unitsToAnimate.length - 1 ? '0.3em' : '0',
            willChange: "transform, opacity",
          } as unknown as Record<string, SpringValue | string | number>}
        >
          {!isArabic && unit === ' ' ? '\u00A0' : unit}
        </animated.span>
      ))}
    </p>
  );
};

export default SplitText; 
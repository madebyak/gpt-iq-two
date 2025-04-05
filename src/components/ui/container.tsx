import React from "react";
import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  as?: React.ElementType;
}

/**
 * A responsive container component that adapts to different screen sizes.
 * Uses percentage-based width with a maximum cap to ensure optimal layout
 * on all devices from mobile to ultrawide displays.
 */
export function Container({
  children,
  className,
  as: Component = "div",
  ...props
}: ContainerProps) {
  return (
    <Component
      className={cn(
        "mx-auto w-[95%] md:w-[90%] max-w-[1800px] px-4 sm:px-6 lg:px-8",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

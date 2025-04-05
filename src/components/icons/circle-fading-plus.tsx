import React from "react";

interface CircleFadingPlusProps {
  className?: string;
}

export const CircleFadingPlus: React.FC<CircleFadingPlusProps> = ({ className }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10" opacity="0.5" />
      <path d="M12 8v8" />
      <path d="M8 12h8" />
    </svg>
  );
};

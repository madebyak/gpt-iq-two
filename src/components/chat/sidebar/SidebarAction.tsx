"use client";

import { memo } from "react";
import { SidebarButton } from "./SidebarButton";

interface SidebarActionProps {
  collapsed: boolean;
  locale: string;
  href: string;
  label: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const SidebarActionComponent: React.FC<SidebarActionProps> = (props) => {
  return <SidebarButton {...props} variant="ghost" size="sm" />;
};

export const SidebarAction = memo(SidebarActionComponent);

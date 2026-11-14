import type { ReactNode } from "react";

interface PanelProps {
  children: ReactNode;
  className?: string;
}

// Provides a reusable container for page content.
export function Panel({ children, className = "" }: PanelProps) {
  return <section className={`panel ${className}`}>{children}</section>;
}


import {
  CircleUserRound,
  ClipboardCheck,
  FlaskConical,
  House,
  type LucideIcon,
} from "lucide-react";

import type { Page } from "../types/navigation";

// Each navigation item has a page name and its matching icon.
interface NavigationItem {
  label: Page;
  icon: LucideIcon;
}

// These are the four main pages shown in the sidebar.
// Emergency is opened using the persistent SOS button.
export const nav: NavigationItem[] = [
  { label: "Mission Overview", icon: House },
  { label: "Body Explorer", icon: CircleUserRound },
  { label: "Health Check-in", icon: ClipboardCheck },
  { label: "Research & Environment", icon: FlaskConical },
];

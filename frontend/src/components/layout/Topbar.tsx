import {
  Bell,
  CloudOff,
  Menu,
  Moon,
  Radio,
  Search,
  ShieldAlert,
  Sun,
} from "lucide-react";

import type { Page } from "../../types/navigation";

interface TopbarProps {
  page: Page;
  offline: boolean;
  openMenu: () => void;
  navigate: (page: Page) => void;
  theme: "dark" | "light";
  toggleTheme: () => void;
}

// Displays the top navigation bar and mission status.
export function Topbar({
  page,
  offline,
  openMenu,
  navigate,
  theme,
  toggleTheme,
}: TopbarProps) {
  return (
    <div className="topbar">
      <button
        className="menu-btn"
        onClick={openMenu}
        aria-label="Open navigation menu"
      >
        <Menu />
      </button>

      <div className="breadcrumb">
        <span>SALORIS</span>
        <b>/</b>
        {page}
      </div>

      <div className="top-actions">
        <button
          className="persistent-sos"
          onClick={() => navigate("Emergency")}
        >
          <ShieldAlert />
          SOS
        </button>

        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          aria-pressed={theme === "light"}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? <Sun /> : <Moon />}
        </button>

        <button aria-label="Search">
          <Search />
        </button>

        <button aria-label="Notifications">
          <Bell />
          <i />
        </button>

        <span className={offline ? "offline" : ""}>
          {offline ? <CloudOff /> : <Radio />}
          {offline ? "Offline · local mode" : "Local · demonstration data"}
        </span>
      </div>
    </div>
  );
}

import { ChevronDown, CloudOff, MoreHorizontal, Radio, X } from "lucide-react";

import { SalorisMark } from "../common/SalorisMark";
import type { Page } from "../../types/navigation";
import { nav } from "../../app/navigation";
import type { Astronaut } from "../../services/api/client";

interface SidebarProps {
  page: Page;
  menuOpen: boolean;
  offline: boolean;
  navigate: (page: Page) => void;
  closeMenu: () => void;
  toggleOffline: () => void;
  astronaut: Astronaut | null;
  openProfile: () => void;
}

// Displays the SALORIS sidebar and main navigation.
export function Sidebar({
  page,
  menuOpen,
  offline,
  navigate,
  closeMenu,
  toggleOffline,
  astronaut,
  openProfile,
}: SidebarProps) {
  return (
    <>
      <aside className={menuOpen ? "open" : ""}>
        <div className="brand">
          <SalorisMark compact />

          <div className="brand-wordmark">
            <b>SALORIS</b>
            <small>HUMAN HEALTH SYSTEM</small>
          </div>

          <button
            className="mobile-close"
            onClick={closeMenu}
            aria-label="Close navigation menu"
          >
            <X />
          </button>
        </div>

        <div className="mission-id">
          <span>ACTIVE MISSION</span>
          <b>{astronaut?.missionName ?? "NO MISSION SELECTED"}</b>

          <small>
            <i /> Mission day 184
          </small>
        </div>

        <nav aria-label="Primary navigation">
          {nav.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={page === label ? "active" : ""}
              onClick={() => navigate(label)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button className="sync-card" onClick={toggleOffline}>
            {offline ? <CloudOff /> : <Radio />}

            <span>
              <b>{offline ? "Offline mode" : "Demo dataset ready"}</b>
              <small>
                {offline ? "Local library available" : "No backend connected"}
              </small>
            </span>

            <MoreHorizontal />
          </button>

          <button className="profile" onClick={openProfile}>
            <span>{astronaut?.callsign ?? "?"}</span>

            <div>
              <b>{astronaut?.fullName ?? "Select astronaut profile"}</b>
              <small>{astronaut ? astronaut.missionName : "Profile setup"}</small>
            </div>

            <ChevronDown size={15} />
          </button>
        </div>
      </aside>

      {menuOpen && <div className="scrim" onClick={closeMenu} />}
    </>
  );
}

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";

import type { Page } from "../../types/navigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import type { Astronaut } from "../../services/api/client";

interface AppLayoutProps {
  page: Page;
  theme: "dark" | "light";
  offline: boolean;
  menuOpen: boolean;
  navigate: (page: Page) => void;
  openMenu: () => void;
  closeMenu: () => void;
  toggleOffline: () => void;
  toggleTheme: () => void;
  children: ReactNode;
  astronaut: Astronaut | null;
  openProfile: () => void;
}

// Combines the sidebar, topbar, page content and footer.
export function AppLayout({
  page,
  theme,
  offline,
  menuOpen,
  navigate,
  openMenu,
  closeMenu,
  toggleOffline,
  toggleTheme,
  children,
  astronaut,
  openProfile,
}: AppLayoutProps) {
  return (
    <div
      className={`app-shell ${page === "Emergency" ? "emergency-mode" : ""}`}
      data-theme={theme}
    >
      <Sidebar
        page={page}
        menuOpen={menuOpen}
        offline={offline}
        navigate={navigate}
        closeMenu={closeMenu}
        toggleOffline={toggleOffline}
        astronaut={astronaut}
        openProfile={openProfile}
      />

      <div className="main-column">
        <Topbar
          page={page}
          offline={offline}
          openMenu={openMenu}
          navigate={navigate}
          theme={theme}
          toggleTheme={toggleTheme}
        />

        <main id="main-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.22 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        <footer>
          <span>SALORIS · Human Resilience Beyond the Horizon.</span>
          <span>
            Independent decision support · Not NASA-endorsed · Not a diagnostic
            system
          </span>
        </footer>
      </div>
    </div>
  );
}

import { lazy, Suspense, useEffect, useState } from "react";

import { AnimatePresence, motion } from "motion/react";

import { SalorisMark } from "../components/common/SalorisMark";
import { AppLayout } from "../components/layout/AppLayout";

const Overview = lazy(() =>
  import("../features/overview/Overview").then((module) => ({
    default: module.Overview,
  })),
);

const CheckIn = lazy(() =>
  import("../features/check-in/CheckIn").then((module) => ({
    default: module.CheckIn,
  })),
);

const BodyExplorer = lazy(() =>
  import("../features/body-explorer/BodyExplorer").then((module) => ({
    default: module.BodyExplorer,
  })),
);

const Emergency = lazy(() =>
  import("../features/emergency/Emergency").then((module) => ({
    default: module.Emergency,
  })),
);

const ResearchEnvironment = lazy(() =>
  import("../features/research/ResearchEnvironment").then((module) => ({
    default: module.ResearchEnvironment,
  })),
);
import type { Page } from "../types/navigation";

type Theme = "dark" | "light";

// Controls the main SALORIS application.
export default function App() {
  const [page, setPage] = useState<Page>("Mission Overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [offline, setOffline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = window.localStorage.getItem("saloris-theme");
    return savedTheme === "light" ? "light" : "dark";
  });

  // Show the SALORIS loading screen briefly when the app starts.
  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 650);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("saloris-theme", theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // Change the current page and close the mobile menu.
  function navigate(next: Page) {
    setPage(next);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Select the page that should appear in the main content area.
  function renderCurrentPage() {
    switch (page) {
      case "Mission Overview":
        return <Overview navigate={navigate} />;

      case "Health Check-in":
        return <CheckIn />;

      case "Body Explorer":
        return <BodyExplorer navigate={navigate} />;

      case "Emergency":
        return <Emergency />;

      case "Research & Environment":
        return <ResearchEnvironment />;

      default:
        return <Overview navigate={navigate} />;
    }
  }

  return (
    <>
      <AnimatePresence>
        {loading && (
          <motion.div
            className="saloris-loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <SalorisMark />
            <b>SALORIS</b>
            <span>Human Resilience Beyond the Horizon.</span>
            <i />
          </motion.div>
        )}
      </AnimatePresence>

      <AppLayout
        page={page}
        theme={theme}
        offline={offline}
        menuOpen={menuOpen}
        navigate={navigate}
        openMenu={() => setMenuOpen(true)}
        closeMenu={() => setMenuOpen(false)}
        toggleOffline={() => setOffline((current) => !current)}
        toggleTheme={() =>
          setTheme((current) => (current === "dark" ? "light" : "dark"))
        }
      >
        <Suspense fallback={<div>Loading page...</div>}>
          {renderCurrentPage()}
        </Suspense>
      </AppLayout>
    </>
  );
}

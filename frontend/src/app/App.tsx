import { lazy, Suspense, useEffect, useState, type FormEvent } from "react";

import { AnimatePresence, motion } from "motion/react";

import { SalorisMark } from "../components/common/SalorisMark";
import { AppLayout } from "../components/layout/AppLayout";
import {
  createAstronaut,
  getAstronauts,
  getSelectedAstronautId,
  selectAstronaut,
  type Astronaut,
} from "../services/api/client";

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
  const [astronaut, setAstronaut] = useState<Astronaut | null>(null);
  const [profiles, setProfiles] = useState<Astronaut[]>([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [offlineEmergencyOnly, setOfflineEmergencyOnly] = useState(false);

  useEffect(() => {
    let active = true;
    void getAstronauts()
      .then((records) => {
        if (!active) return;
        setProfiles(records);
        const selected = records.find(
          (record) => record.id === getSelectedAstronautId(),
        );
        setAstronaut(selected ?? null);
      })
      .catch(() => {
        if (active) setProfileError("Astronaut profiles could not be loaded.");
      })
      .finally(() => {
        if (active) setProfileLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

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

  function chooseAstronaut(record: Astronaut) {
    selectAstronaut(record.id);
    setAstronaut(record);
    setProfileOpen(false);
    setProfileError("");
  }

  // Select the page that should appear in the main content area.
  function renderCurrentPage(currentAstronaut: Astronaut | null) {
    switch (page) {
      case "Mission Overview":
        return currentAstronaut ? (
          <Overview navigate={navigate} astronaut={currentAstronaut} />
        ) : null;

      case "Health Check-in":
        return <CheckIn />;

      case "Body Explorer":
        return <BodyExplorer navigate={navigate} />;

      case "Emergency":
        return <Emergency astronaut={currentAstronaut} />;

      case "Research & Environment":
        return <ResearchEnvironment />;

      default:
        return currentAstronaut ? (
          <Overview navigate={navigate} astronaut={currentAstronaut} />
        ) : null;
    }
  }

  if (profileLoading) {
    return <div className="saloris-loader">Loading astronaut profiles...</div>;
  }

  if ((!astronaut && !offlineEmergencyOnly) || profileOpen) {
    return (
      <ProfileSetup
        profiles={profiles}
        error={profileError}
        onSelect={chooseAstronaut}
        onCreated={(record) => {
          setProfiles((current) => [...current, record]);
          chooseAstronaut(record);
        }}
        onCancel={astronaut ? () => setProfileOpen(false) : undefined}
        onOfflineEmergency={() => {
          setOfflineEmergencyOnly(true);
          setPage("Emergency");
        }}
      />
    );
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
        astronaut={astronaut}
        openProfile={() => setProfileOpen(true)}
      >
        <Suspense fallback={<div>Loading page...</div>}>
          {renderCurrentPage(astronaut)}
        </Suspense>
      </AppLayout>
    </>
  );
}

function ProfileSetup({
  profiles,
  error,
  onSelect,
  onCreated,
  onCancel,
  onOfflineEmergency,
}: {
  profiles: Astronaut[];
  error: string;
  onSelect: (record: Astronaut) => void;
  onCreated: (record: Astronaut) => void;
  onCancel?: () => void;
  onOfflineEmergency: () => void;
}) {
  const [fullName, setFullName] = useState("");
  const [callsign, setCallsign] = useState("");
  const [missionName, setMissionName] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!fullName.trim() || !callsign.trim() || !missionName.trim()) {
      setFormError("Enter your name, callsign and mission name.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const record = await createAstronaut({
        fullName: fullName.trim(),
        callsign: callsign.trim(),
        missionName: missionName.trim(),
      });
      onCreated(record);
    } catch {
      setFormError("The profile could not be saved. Check the backend connection.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="profile-setup">
      <div className="profile-setup-card">
        <SalorisMark />
        <span className="eyebrow">Astronaut profile</span>
        <h1>Set up your SALORIS profile</h1>
        <p>
          Select an existing profile or create your own. SALORIS will use this
          identity to keep readings, alerts and emergency events separate.
        </p>
        {profiles.length > 0 && (
          <div className="profile-options">
            {profiles.map((record) => (
              <button key={record.id} type="button" onClick={() => onSelect(record)}>
                <b>{record.fullName}</b>
                <span>{record.callsign} · {record.missionName}</span>
              </button>
            ))}
          </div>
        )}
        <form onSubmit={submit}>
          <input aria-label="Astronaut name" placeholder="Your name" value={fullName} onChange={(event) => setFullName(event.target.value)} />
          <input aria-label="Callsign" placeholder="Callsign" value={callsign} onChange={(event) => setCallsign(event.target.value)} />
          <input aria-label="Mission name" placeholder="Mission name" value={missionName} onChange={(event) => setMissionName(event.target.value)} />
          <button className="primary-btn" disabled={saving}>
            {saving ? "Saving..." : "Create profile"}
          </button>
        </form>
        {(error || formError) && <p className="field-error" role="alert">{error || formError}</p>}
        {onCancel && <button className="secondary-btn" onClick={onCancel}>Cancel</button>}
        <button className="secondary-btn" onClick={onOfflineEmergency}>
          Open emergency instructions offline
        </button>
      </div>
    </main>
  );
}

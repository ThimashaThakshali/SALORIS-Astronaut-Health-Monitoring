import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  FileHeart,
  Info,
  ShieldAlert,
  X,
} from "lucide-react";

import { PageHeader } from "../../components/common/PageHeader";
import { Panel } from "../../components/common/Panel";
import {
  createEmergencyEvent,
  ensureAstronaut,
} from "../../services/api/client";

// Demonstration-only emergency reference content.
// Operational procedures must be approved by mission medical leadership.
const emergencies = [
  [
    "Cardiac emergency",
    "Stop activity, notify a crewmate and contact mission medical support immediately. Follow the approved chest-pain protocol.",
  ],
  [
    "Collapse or unconsciousness",
    "Call for crew assistance, initiate the mission emergency response and follow basic life-support protocol if trained.",
  ],
  [
    "Breathing difficulty",
    "Stop activity, move to a safe atmosphere if directed and contact mission medical support immediately.",
  ],
  [
    "Severe injury",
    "Activate crew emergency response and follow the authorised injury procedure using approved equipment.",
  ],
  [
    "Suspected hypoxia",
    "Alert the crew, verify cabin atmosphere using approved instrumentation and follow the hypoxia response protocol.",
  ],
  [
    "Other serious symptoms",
    "Stop activity, alert a crewmate and contact designated medical support using the mission priority channel.",
  ],
];

type ActivationState = "idle" | "confirm" | "demo";

// Displays emergency reference guidance and a local SOS demonstration.
export function Emergency() {
  const [active, setActive] = useState(0);
  const [activation, setActivation] = useState<ActivationState>("idle");
  const [eventMessage, setEventMessage] = useState("");

  const createDemoEvent = async () => {
    setEventMessage("");
    setActivation("demo");

    try {
      const astronaut = await ensureAstronaut();
      await createEmergencyEvent({
        astronautId: astronaut.id,
        description: `Demonstration SOS: ${emergencies[active][0]}`,
        idempotencyKey: `demo-sos:${Date.now()}`,
      });
      setEventMessage("The demonstration event was synchronized with the backend.");
    } catch {
      setEventMessage(
        "The demonstration event remains local because the backend is unavailable.",
      );
    }
  };

  return (
    <>
      <div className="emergency-banner">
        <ShieldAlert />

        <div>
          <b>For immediate or life-threatening danger</b>
          <p>
            Activate your mission's emergency communication and crew response
            procedure now.
          </p>
        </div>

        <button onClick={() => setActivation("confirm")}>
          Activate SOS demo
        </button>
      </div>

      <PageHeader
        eyebrow="Crew medical response"
        title="Emergency assistance"
        description="Pre-authored quick-reference guidance. Follow the current, approved mission medical checklist over this prototype."
      />

      <div className="emergency-layout">
        <div className="emergency-list">
          {emergencies.map((emergency, index) => (
            <button
              className={active === index ? "active" : ""}
              onClick={() => setActive(index)}
              key={emergency[0]}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <b>{emergency[0]}</b>
              <ArrowRight size={17} />
            </button>
          ))}
        </div>

        <Panel className="protocol">
          <div className="protocol-head">
            <span>
              <AlertTriangle />
            </span>

            <div>
              <small>
                Quick protocol · {String(active + 1).padStart(2, "0")}
              </small>
              <h2>{emergencies[active][0]}</h2>
            </div>
          </div>

          <div className="do-now">
            <b>Immediate actions</b>
            <p>{emergencies[active][1]}</p>
          </div>

          <ol>
            <li>
              <span>1</span>
              <div>
                <b>Ensure scene safety</b>
                <p>
                  Confirm the area is safe for the affected crewmember and
                  responders.
                </p>
              </div>
            </li>

            <li>
              <span>2</span>
              <div>
                <b>Call and escalate</b>
                <p>
                  Notify the crew medical officer and mission control using the
                  priority channel.
                </p>
              </div>
            </li>

            <li>
              <span>3</span>
              <div>
                <b>Use the approved checklist</b>
                <p>
                  Open the current onboard procedure. Record onset time and
                  observable changes.
                </p>
              </div>
            </li>
          </ol>

          <div className="source-box">
            <FileHeart size={18} />

            <div>
              <b>Protocol governance</b>
              <p>
                Prototype wording for demonstration. Operational content must be
                authored, sourced, version-controlled and approved by mission
                medical leadership.
              </p>
              <small>Review status: DEMO ONLY · Version 0.9</small>
            </div>
          </div>

          <p className="no-medication">
            SALORIS does not provide medication or dosing instructions and does
            not infer a diagnosis.
          </p>

          <div className="incident-summary">
            <div>
              <span className="eyebrow">Structured incident summary</span>
              <h3>{emergencies[active][0]}</h3>
            </div>

            <dl>
              <div>
                <dt>Category</dt>
                <dd>{emergencies[active][0]}</dd>
              </div>

              <div>
                <dt>Location</dt>
                <dd>Ares Transit 01 · crew habitat</dd>
              </div>

              <div>
                <dt>Communication</dt>
                <dd>
                  {activation === "demo"
                    ? "Demonstration event created locally"
                    : "Not activated"}
                </dd>
              </div>

              <div>
                <dt>Operational status</dt>
                <dd>No emergency signal has been transmitted</dd>
              </div>
            </dl>
          </div>
        </Panel>
      </div>

      {activation === "confirm" && (
        <div className="confirmation-backdrop" role="presentation">
          <section
            className="confirmation-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-sos-title"
          >
            <ShieldAlert size={28} />

            <span className="eyebrow">Deliberate confirmation</span>

            <h2 id="confirm-sos-title">Create a demonstration SOS event?</h2>

            <p>
              This prototype cannot contact mission control, medical support, or
              emergency services. Use the authorised mission communication
              system for a real emergency.
            </p>

            <div>
              <button
                className="secondary-btn"
                onClick={() => setActivation("idle")}
              >
                Cancel
              </button>

              <button
                className="danger-btn"
                onClick={createDemoEvent}
              >
                Confirm demo event
              </button>
            </div>
          </section>
        </div>
      )}

      {activation === "demo" && (
        <div className="demo-emergency-status" role="status">
          <Info size={17} />

          <div>
            <b>Demonstration event created</b>
            <p>
              No signal was transmitted. Follow authorised mission protocol for
              a real emergency. {eventMessage}
            </p>
          </div>

          <button
            onClick={() => setActivation("idle")}
            aria-label="Dismiss demonstration status"
          >
            <X size={17} />
          </button>
        </div>
      )}
    </>
  );
}

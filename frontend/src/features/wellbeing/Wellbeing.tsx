import { useState } from "react";
import {
  ArrowRight,
  CircleUserRound,
  LifeBuoy,
  Moon,
  Sparkles,
  Waves,
} from "lucide-react";

import { DemoBadge } from "../../components/common/DemoBadge";
import { PageHeader } from "../../components/common/PageHeader";
import { Panel } from "../../components/common/Panel";

// Displays mental wellbeing and crew support information.
export function Wellbeing() {
  // Stores the selected mood from 0 to 4.
  const [mood, setMood] = useState(4);

  return (
    <>
      <PageHeader
        eyebrow="Behavioural health"
        title="Mental wellbeing"
        description="Private, routine reflection to notice changes in mood, stress, sleep and connection over time."
        action={<DemoBadge />}
      />

      <div className="wellbeing-grid">
        <Panel className="mood-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Today's reflection</span>
              <h2>How are you feeling?</h2>
            </div>

            <Sparkles />
          </div>

          <div className="mood-picker">
            {["Very low", "Low", "Neutral", "Good", "Strong"].map(
              (option, index) => (
                <button
                  className={mood === index ? "active" : ""}
                  onClick={() => setMood(index)}
                  key={option}
                >
                  <span>{index + 1}</span>
                  {option}
                </button>
              ),
            )}
          </div>

          <label>What's influencing this today?</label>

          <textarea placeholder="Optional private note..." />

          <button className="primary-btn">Save reflection</button>
        </Panel>

        <Panel>
          <span className="eyebrow">Wellbeing pulse</span>
          <h2>7-day balance</h2>

          <div className="wellbeing-score">
            <strong>78</strong>

            <span>
              Stable
              <br />
              <small>+6 this week</small>
            </span>
          </div>

          <div className="well-bars">
            <div>
              <span>Sleep consistency</span>
              <i>
                <b style={{ width: "74%" }} />
              </i>
              <strong>74%</strong>
            </div>

            <div>
              <span>Stress recovery</span>
              <i>
                <b style={{ width: "81%" }} />
              </i>
              <strong>81%</strong>
            </div>

            <div>
              <span>Social connection</span>
              <i>
                <b style={{ width: "86%" }} />
              </i>
              <strong>86%</strong>
            </div>
          </div>
        </Panel>
      </div>

      <div className="resource-grid">
        <Panel>
          <Waves />
          <h3>2-minute reset</h3>
          <p>Follow a paced breathing guide before your next task block.</p>
          <button className="text-btn">
            Begin exercise <ArrowRight size={14} />
          </button>
        </Panel>

        <Panel>
          <CircleUserRound />
          <h3>Crew connection</h3>
          <p>Schedule a short check-in with a crewmate or support contact.</p>
          <button className="text-btn">
            View connection plan <ArrowRight size={14} />
          </button>
        </Panel>

        <Panel>
          <Moon />
          <h3>Sleep wind-down</h3>
          <p>
            Reduce stimulation and prepare your scheduled sleep environment.
          </p>
          <button className="text-btn">
            Open routine <ArrowRight size={14} />
          </button>
        </Panel>
      </div>

      <div className="support-note">
        <LifeBuoy />

        <div>
          <b>You do not have to manage distress alone.</b>
          <p>
            For persistent low mood, severe distress, thoughts of self-harm or
            concern about a crewmate, contact mission medical support using the
            approved confidential pathway.
          </p>
        </div>
      </div>
    </>
  );
}

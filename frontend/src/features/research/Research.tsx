import { useState } from "react";
import { ArrowRight, Info, Search } from "lucide-react";

import { PageHeader } from "../../components/common/PageHeader";
import { Panel } from "../../components/common/Panel";

// Describes the five major hazards of human spaceflight.
const hazards = [
  [
    "Radiation",
    "Beyond Earth's protective magnetic field, ionising radiation can increase long-term health risks.",
  ],
  [
    "Isolation & confinement",
    "Limited space, separation and operational stress can affect behavioural health and team performance.",
  ],
  [
    "Distance from Earth",
    "Communication delays and limited evacuation increase the need for crew autonomy and robust procedures.",
  ],
  [
    "Gravity fields",
    "Transitions between microgravity and partial gravity affect bones, muscles, balance and cardiovascular function.",
  ],
  [
    "Hostile environments",
    "Closed habitats, dust, pressure boundaries and limited resources create complex exposure risks.",
  ],
];

// Displays spaceflight hazards and public research references.
export function Research() {
  // Stores the text entered into the research search box.
  const [query, setQuery] = useState("");

  // Shows only hazards that match the search text.
  const filtered = hazards.filter((hazard) =>
    hazard.join(" ").toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <>
      <PageHeader
        eyebrow="Evidence library"
        title="Research centre"
        description="Plain-language learning grounded in public human spaceflight research from NASA and the Canadian Space Agency."
      />

      <div className="research-search">
        <Search size={18} />

        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search hazards, body systems or monitoring methods..."
        />

        <span>Offline library available</span>
      </div>

      <div className="five-hazards">
        <span className="eyebrow">The five hazards of human spaceflight</span>
        <h2>Understand the mission context</h2>

        <div className="hazard-grid">
          {filtered.map((hazard, index) => (
            <article key={hazard[0]}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{hazard[0]}</h3>
              <p>{hazard[1]}</p>

              <button className="text-btn">
                Explore evidence <ArrowRight size={14} />
              </button>
            </article>
          ))}
        </div>

        {filtered.length === 0 && (
          <p>No matching hazards found. Try another search term.</p>
        )}
      </div>

      <div className="reference-grid">
        <Panel>
          <div className="source-logo">NASA</div>

          <div>
            <span className="eyebrow">Public reference</span>
            <h3>Human Research Program</h3>
            <p>
              Research on risks to human health and performance during space
              exploration.
            </p>

            <a
              href="https://www.nasa.gov/hrp/"
              target="_blank"
              rel="noreferrer"
            >
              Visit source <ArrowRight size={13} />
            </a>
          </div>
        </Panel>

        <Panel>
          <div className="source-logo csa">CSA</div>

          <div>
            <span className="eyebrow">Public reference</span>
            <h3>Health science in space</h3>
            <p>
              Canadian research into astronaut health, ageing and the effects of
              spaceflight.
            </p>

            <a
              href="https://www.asc-csa.gc.ca/eng/sciences/health.asp"
              target="_blank"
              rel="noreferrer"
            >
              Visit source <ArrowRight size={13} />
            </a>
          </div>
        </Panel>
      </div>

      <div className="research-disclaimer">
        <Info />

        <p>
          References are provided for education and traceability. SALORIS is an
          independent concept and is not endorsed by NASA or the Canadian Space
          Agency. Content for operational use requires formal medical and
          mission review.
        </p>
      </div>
    </>
  );
}

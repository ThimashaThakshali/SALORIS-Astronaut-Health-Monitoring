import { memo, useState, type KeyboardEvent, type ReactNode } from "react";
import type { BodyRegion } from "../../../data";

type View = "front" | "back";

interface AnatomyMapProps {
  selected: BodyRegion;
  onSelect: (region: BodyRegion) => void;
  view: View;
}

const callouts: Record<BodyRegion, { anchor: [number, number]; side: "left" | "right" }> = {
  Brain: { anchor: [150, 46], side: "left" },
  Eyes: { anchor: [150, 66], side: "right" },
  "Inner ear and balance": { anchor: [178, 67], side: "right" },
  Lungs: { anchor: [164, 145], side: "right" },
  Heart: { anchor: [142, 165], side: "left" },
  Blood: { anchor: [179, 206], side: "right" },
  "Digestive system": { anchor: [151, 225], side: "left" },
  Bones: { anchor: [150, 287], side: "right" },
  Muscles: { anchor: [105, 226], side: "left" },
  Skin: { anchor: [210, 245], side: "right" },
};

const BodyBase = memo(function BodyBase({ view }: { view: View }) {
  return (
    <g className={`anatomy-base anatomy-${view}`}>
      <path
        className="body-outline"
        d="M150 18c-23 0-41 19-41 44 0 18 8 31 19 38l-5 12c-27 8-46 29-50 62l-9 69-28 94c-5 17 17 25 25 9l35-88 4-34 1 87-13 139c-2 18 9 29 22 28 11-1 16-10 19-25l21-105 21 105c3 15 8 24 19 25 13 1 24-10 22-28l-13-139 1-87 4 34 35 88c8 16 30 8 25-9l-28-94-9-69c-4-33-23-54-50-62l-5-12c11-7 19-20 19-38 0-25-18-44-41-44Z"
      />
      <path
        className="anatomy-contour"
        d="M126 113c14 8 34 8 48 0M101 207c27 14 71 14 98 0M100 312c31-9 69-9 100 0"
      />
      <path className="face-detail" d="M140 79c7 5 13 5 20 0m-10-3v8" />
      {view === "back" && (
        <path
          className="back-contour"
          d="M127 117c12 12 34 12 46 0m-60 48c22 18 52 18 74 0m-73 77c23-14 49-14 72 0"
        />
      )}
    </g>
  );
});

function InteractiveRegion({
  region,
  selected,
  onSelect,
  onHover,
  children,
}: {
  region: BodyRegion;
  selected: boolean;
  onSelect: (region: BodyRegion) => void;
  onHover: (region: BodyRegion | null) => void;
  children: ReactNode;
}) {
  const activate = (event: KeyboardEvent<SVGGElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(region);
    }
  };
  return (
    <g
      className={`anatomy-region region-${region.toLowerCase().replaceAll(" ", "-")} ${selected ? "is-selected" : ""}`}
      role="button"
      tabIndex={0}
      aria-label={`Select ${region}`}
      aria-pressed={selected}
      onClick={() => onSelect(region)}
      onKeyDown={activate}
      onMouseEnter={() => onHover(region)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(region)}
      onBlur={() => onHover(null)}
    >
      {children}
    </g>
  );
}

function Skeleton({
  selected,
  onSelect,
  onHover,
}: {
  selected: boolean;
  onSelect: (region: BodyRegion) => void;
  onHover: (region: BodyRegion | null) => void;
}) {
  return (
    <InteractiveRegion region="Bones" selected={selected} onSelect={onSelect} onHover={onHover}>
      <g className="skeletal-layer">
        <ellipse cx="150" cy="54" rx="27" ry="31" />
        <path d="M150 86v222m-32-178 32 19 32-19M115 148h70M111 164h78M109 181h82M123 207l27 17 27-17M150 224l-31 91m31-91 31 91m-31-7-30 124m30-124 30 124M118 132 85 221 51 335m131-203 33 89 34 114" />
        <path className="pelvis" d="M121 207q29 26 58 0l-8 39q-21 19-42 0Z" />
      </g>
      <path
        className="system-hit bone-hit"
        d="M142 89h16v218l34 125-15 5-27-101-27 101-15-5 34-125Z"
      />
    </InteractiveRegion>
  );
}

function Muscles({
  selected,
  onSelect,
  onHover,
  view,
}: {
  selected: boolean;
  onSelect: (region: BodyRegion) => void;
  onHover: (region: BodyRegion | null) => void;
  view: View;
}) {
  return (
    <InteractiveRegion region="Muscles" selected={selected} onSelect={onSelect} onHover={onHover}>
      <g className={`muscle-anatomy muscle-${view}`}>
        <path d="M123 118q27 19 54 0l18 39-18 45-27-13-27 13-18-45Z" />
        <path d="M101 133 76 171l-9 70 24 7 19-73Z" />
        <path d="m199 133 25 38 9 70-24 7-19-73Z" />
        <path d="M106 236q19 15 36 7l-16 82-28-7Z" />
        <path d="M194 236q-19 15-36 7l16 82 28-7Z" />
        <path d="m98 326 29 5-15 100-22 3Z" />
        <path d="m202 326-29 5 15 100 22 3Z" />
      </g>
      <path
        className="system-hit muscle-hit"
        d="M77 130h42l8 144-22 90-28-8 18-95-23-50Zm104 0h42l5 81-23 50 18 95-28 8-22-90Z"
      />
    </InteractiveRegion>
  );
}

export default function AnatomyMap({ selected, onSelect, view }: AnatomyMapProps) {
  const [hovered, setHovered] = useState<BodyRegion | null>(null);
  const activeLabel = hovered ?? selected;
  const callout = callouts[activeLabel];
  const labelX = callout.side === "left" ? 12 : 288;
  const lineEnd = callout.side === "left" ? 82 : 218;

  return (
    <div className="anatomy-map-wrap">
      <svg
        className={`anatomy-map anatomy-view-${view}`}
        viewBox="0 0 300 500"
        role="img"
        aria-labelledby="anatomy-title anatomy-description"
      >
        <title id="anatomy-title">
          {view === "front" ? "Anterior" : "Posterior"} interactive anatomy
        </title>
        <desc id="anatomy-description">
          Original schematic anatomical illustration with selectable organs, circulation, bones,
          muscles and skin. Motion is illustrative and is not measured telemetry.
        </desc>
        <BodyBase view={view} />

        <InteractiveRegion
          region="Skin"
          selected={selected === "Skin"}
          onSelect={onSelect}
          onHover={setHovered}
        >
          <path
            className="skin-region"
            d="M150 18c-23 0-41 19-41 44 0 18 8 31 19 38l-5 12c-27 8-46 29-50 62l-9 69-28 94m114-319c23 0 41 19 41 44 0 18-8 31-19 38l5 12c27 8 46 29 50 62l9 69 28 94"
          />
        </InteractiveRegion>
        <Muscles
          selected={selected === "Muscles"}
          onSelect={onSelect}
          onHover={setHovered}
          view={view}
        />
        <Skeleton selected={selected === "Bones"} onSelect={onSelect} onHover={setHovered} />

        {view === "front" ? (
          <g className="organ-layer">
            <InteractiveRegion
              region="Brain"
              selected={selected === "Brain"}
              onSelect={onSelect}
              onHover={setHovered}
            >
              <path
                className="organ brain"
                d="M123 48c1-18 12-29 27-29s26 11 27 29c2 16-7 28-27 34-20-6-29-18-27-34Z"
              />
              <path
                className="organ-detail"
                d="M137 29c-6 10-1 17 4 22m18-24c7 9 3 17-2 23m-21 12c8-7 20-7 28 0"
              />
            </InteractiveRegion>
            <InteractiveRegion
              region="Eyes"
              selected={selected === "Eyes"}
              onSelect={onSelect}
              onHover={setHovered}
            >
              <path
                className="organ eye"
                d="M127 63q10-10 20 0-10 9-20 0Zm26 0q10-10 20 0-10 9-20 0Z"
              />
              <circle className="pupil" cx="137" cy="63" r="2.5" />
              <circle className="pupil" cx="163" cy="63" r="2.5" />
            </InteractiveRegion>
            <InteractiveRegion
              region="Inner ear and balance"
              selected={selected === "Inner ear and balance"}
              onSelect={onSelect}
              onHover={setHovered}
            >
              <path
                className="organ ear"
                d="M178 56c14-7 19 8 10 15-4 3-3 9-9 11-8-1-10-19-1-26Z"
              />
              <path className="organ-detail" d="M179 64c8-5 10 5 3 8 6 1 6 8 0 9" />
            </InteractiveRegion>
            <InteractiveRegion
              region="Lungs"
              selected={selected === "Lungs"}
              onSelect={onSelect}
              onHover={setHovered}
            >
              <path
                className="organ lung lung-left"
                d="M145 111c-18 3-31 20-30 48 1 24 13 36 31 25l2-69Z"
              />
              <path
                className="organ lung lung-right"
                d="M155 111c18 3 31 20 30 48-1 24-13 36-31 25l-2-69Z"
              />
              <path className="organ-detail airway" d="M150 93v54m0-25-17 17m17-17 17 17" />
            </InteractiveRegion>
            <InteractiveRegion
              region="Heart"
              selected={selected === "Heart"}
              onSelect={onSelect}
              onHover={setHovered}
            >
              <path
                className="organ heart"
                d="M145 146c-11-13-30-2-26 16 4 18 20 30 31 38 11-9 26-22 28-40 2-19-22-24-33-14Z"
              />
              <path className="organ-detail" d="M151 146c-2 13 5 21 17 23" />
            </InteractiveRegion>
            <InteractiveRegion
              region="Blood"
              selected={selected === "Blood"}
              onSelect={onSelect}
              onHover={setHovered}
            >
              <path
                className="organ vessel vessel-main"
                d="M150 96v116m0-49-48 47m48-16 49 45m-49-12-31 105m31-105 31 105"
              />
              <path
                className="organ vessel vessel-secondary"
                d="M145 115 91 174 58 257m97-142 54 59 33 83M137 251l-22 102m48-102 22 102"
              />
            </InteractiveRegion>
            <InteractiveRegion
              region="Digestive system"
              selected={selected === "Digestive system"}
              onSelect={onSelect}
              onHover={setHovered}
            >
              <path className="organ liver" d="M119 198q34-14 62 3l-8 26-54-5Z" />
              <path
                className="organ digestive"
                d="M130 220c18-9 42 0 44 19 2 18-13 22-18 13-6-10-17-3-12 9 6 15 19 17 11 34-8 17-34 6-35-15-2-21 13-25 9-37-3-8-11-14 1-23Z"
              />
            </InteractiveRegion>
          </g>
        ) : (
          <g className="posterior-organ-layer">
            <InteractiveRegion
              region="Brain"
              selected={selected === "Brain"}
              onSelect={onSelect}
              onHover={setHovered}
            >
              <path
                className="organ brain"
                d="M124 48c2-18 12-28 26-28s24 10 26 28c2 17-8 29-26 34-18-5-28-17-26-34Z"
              />
            </InteractiveRegion>
            <InteractiveRegion
              region="Lungs"
              selected={selected === "Lungs"}
              onSelect={onSelect}
              onHover={setHovered}
            >
              <path
                className="organ lung lung-left"
                d="M145 116c-17 3-29 18-29 43 0 22 12 32 30 24Z"
              />
              <path
                className="organ lung lung-right"
                d="M155 116c17 3 29 18 29 43 0 22-12 32-30 24Z"
              />
            </InteractiveRegion>
          </g>
        )}

        <g className="anatomy-callout active-callout" aria-hidden="true">
          <path d={`M${callout.anchor[0]} ${callout.anchor[1]}H${lineEnd}`} />
          <circle cx={callout.anchor[0]} cy={callout.anchor[1]} r="4" />
          <text
            x={labelX}
            y={callout.anchor[1] - 5}
            textAnchor={callout.side === "left" ? "start" : "end"}
          >
            {activeLabel}
          </text>
          <text
            className="callout-subtitle"
            x={labelX}
            y={callout.anchor[1] + 9}
            textAnchor={callout.side === "left" ? "start" : "end"}
          >
            SELECTED REGION
          </text>
        </g>
      </svg>
      <div className="anatomy-attribution">
        Original SALORIS schematic · Educational anatomy · Motion is illustrative, not telemetry
      </div>
    </div>
  );
}

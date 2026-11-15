import {
  memo,
  useId,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import type { BodyRegion } from "../../../data";

type View = "front" | "back";
type Select = (region: BodyRegion) => void;
type Hover = (region: BodyRegion | null) => void;

interface AnatomyMapProps {
  selected: BodyRegion;
  onSelect: (region: BodyRegion) => void;
  view: View;
}

/* ------------------------------------------------------------------ */
/*  Coordinate system                                                  */
/*                                                                     */
/*  All anatomy is authored around a vertical midline at x = 200 and   */
/*  drawn inside a group translated by (OX, OY) into the 520 x 580     */
/*  viewBox. The figure is ~8 heads tall: crown y=30, soles y=523.     */
/*  Callout labels are HTML overlays positioned in percentages of the  */
/*  same box, so figure, oval and labels always scale together.        */
/* ------------------------------------------------------------------ */

const VB_W = 520;
const VB_H = 580;
const OX = 60;
const OY = 22;
const CX = 200;

/* ---------- Silhouette: authored as one half, mirrored in code ---------- */

type Pt = [number, number];

// [dx from midline, y] running down the figure's right side (viewer's right).
const HALF: Pt[] = [
  [0, 30],
  [14, 34],
  [22, 48],
  [21, 66],
  [15, 82],
  [8, 92],
  [9, 99],
  [10, 108],
  [24, 114],
  [44, 119],
  [58, 127],
  [66, 141],
  [70, 170],
  [78, 200],
  [87, 232],
  [96, 262],
  [99, 274],
  [102, 294],
  [100, 311],
  [93, 313],
  [89, 294],
  [84, 268],
  [75, 236],
  [66, 205],
  [60, 178],
  [54, 152],
  [50, 166],
  [46, 186],
  [41, 206],
  [37, 222],
  [39, 245],
  [45, 265],
  [46, 284],
  [44, 312],
  [40, 345],
  [36, 380],
  [34, 405],
  [32, 430],
  [30, 460],
  [28, 490],
  [31, 506],
  [37, 516],
  [35, 523],
  [8, 523],
  [5, 514],
  [8, 495],
  [10, 460],
  [11, 430],
  [10, 405],
  [8, 375],
  [5, 335],
  [3, 308],
  [0, 294],
];

function smoothClosedPath(points: Pt[]): string {
  const n = points.length;
  const at = (i: number) => points[(i + n) % n];
  const f = (v: number) => v.toFixed(1);
  let d = `M${f(points[0][0])} ${f(points[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += `C${f(c1x)} ${f(c1y)} ${f(c2x)} ${f(c2y)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return `${d}Z`;
}

const OUTLINE_POINTS: Pt[] = [
  ...HALF.map(([dx, y]): Pt => [CX + dx, y]),
  ...HALF.slice(1, -1)
    .reverse()
    .map(([dx, y]): Pt => [CX - dx, y]),
];
const OUTLINE = smoothClosedPath(OUTLINE_POINTS);

/* ---------- Skeleton geometry (right side unless noted) ---------- */

const SKULL =
  "M200 34C214 34 219 46 218 58C217 66 214 70 211 73L210 84Q200 88 190 84L189 73C186 70 183 66 182 58C181 46 186 34 200 34Z";

const VERTEBRAE = Array.from({ length: 24 }, (_, i) => {
  const w = 6 + (i / 23) * 9;
  const y = 97 + i * 7.4;
  return `M${(200 - w / 2).toFixed(1)} ${y.toFixed(1)}h${w.toFixed(1)}v5h-${w.toFixed(1)}Z`;
}).join("");

const RIB_WIDTH = [20, 27, 32, 35, 37, 37, 36, 34, 31, 28];
const RIBS = RIB_WIDTH.map((w, i) => {
  const y = 121 + i * 8.2;
  const front = 204 + (i > 6 ? (i - 6) * 3 : 0);
  return (
    `M202 ${y.toFixed(1)}C${(200 + w * 0.55).toFixed(1)} ${(y - 5).toFixed(1)} ${200 + w} ${y.toFixed(1)} ${200 + w} ${(y + 9).toFixed(1)}` +
    `C${200 + w} ${(y + 19).toFixed(1)} ${(200 + w * 0.45).toFixed(1)} ${(y + 21 + i * 0.6).toFixed(1)} ${front} ${(y + 20 + i * 0.5).toFixed(1)}`
  );
});

const STERNUM = "M196 117h8l1.5 48-5.5 9-5.5-9Z";
const SACRUM = "M193 250h14l-3 26-4 8-4-8Z";
const PELVIS =
  "M203 252C214 244 236 244 241 256C243 270 236 284 226 290L214 288C210 282 206 276 203 272Z";
const SCAPULA =
  "M208 128C222 124 240 126 246 132L238 164C228 168 216 160 210 150Z";

/* ---------- Muscle geometry ---------- */

const ABS = Array.from(
  { length: 5 },
  (_, i) => `M203 ${166 + i * 14}h14v12h-14Z`,
).join("");

const FRONT_TORSO_MUSCLES = [
  // pectoral
  "M203 122C218 116 242 120 250 132C248 148 232 158 216 158C208 156 204 150 203 142Z",
  // abdominal wall + oblique
  ABS,
  "M221 162C233 170 238 198 236 232C230 236 224 232 221 226Z",
];

const BACK_TORSO_MUSCLES = [
  // trapezius
  "M200 100C214 104 232 112 246 122C244 140 226 160 200 192C200 160 200 130 200 100Z",
  // latissimus dorsi
  "M203 192C222 170 240 150 248 152C250 180 242 206 232 224C218 220 208 208 203 192Z",
  // gluteal
  "M203 250C220 244 240 252 242 272C240 292 220 298 203 290Z",
];

const LIMB_MUSCLES = [
  // deltoid
  "M244 122C256 124 266 134 266 150C262 160 254 158 250 150C248 140 246 130 244 122Z",
  // upper arm
  "M258 140C270 146 276 176 278 206C272 212 264 208 262 198C258 180 256 160 258 140Z",
  // forearm
  "M273 222C283 228 291 248 296 268L289 274C281 262 274 246 270 230Z",
  // thigh
  "M206 296C226 288 242 296 241 322C240 352 236 384 228 398C218 396 210 380 207 350C205 330 205 312 206 296Z",
  // calf
  "M214 414C226 410 230 424 229 444C228 462 224 478 219 490C212 478 209 452 210 432C210 424 211 418 214 414Z",
];

/* ---------- Digestive / urinary / vessel geometry ---------- */

const LUNG =
  "M205 127C222 122 240 136 242 162C243 184 236 197 222 197C212 197 206 193 205 186Z";
const KIDNEY =
  "M222 205C230 203 235 213 234 225C233 237 229 243 225 241C222 239 223 233 225 229C227 225 226 220 224 216C222 211 220 207 222 205Z";
const LEG_ARTERY =
  "M204 256C210 276 216 296 217 320C218 360 216 396 214 416C214 450 217 478 219 496";
const ARM_ARTERY =
  "M206 130C226 122 248 122 258 136C264 160 270 190 274 214C280 238 288 256 292 270";
const NECK_ARTERY = "M206 134C207 120 206 104 204 90C204 80 205 72 206 66";

/* ---------- Callout configuration (front-view coordinates) ---------- */

const CALLOUTS: Record<BodyRegion, { anchor: Pt; side: "left" | "right" }> = {
  Brain: { anchor: [190, 42], side: "left" },
  Eyes: { anchor: [192, 63], side: "left" },
  "Inner ear and balance": { anchor: [226, 66], side: "right" },
  Heart: { anchor: [222, 168], side: "right" },
  Lungs: { anchor: [184, 150], side: "left" },
  Blood: { anchor: [184, 310], side: "left" },
  "Digestive system": { anchor: [214, 249], side: "right" },
  "Kidneys / urinary system": { anchor: [173, 224], side: "left" },
  Bones: { anchor: [177, 404], side: "left" },
  Muscles: { anchor: [230, 345], side: "right" },
  Skin: { anchor: [245, 290], side: "right" },
};

/* ------------------------------------------------------------------ */
/*  Small helpers                                                      */
/* ------------------------------------------------------------------ */

/** Renders children once and once mirrored across the midline. */
function Pair({ children }: { children: ReactNode }) {
  return (
    <>
      <g>{children}</g>
      <g transform="translate(400 0) scale(-1 1)">{children}</g>
    </>
  );
}

const slug = (region: string) =>
  region.toLowerCase().replace(/[^a-z0-9]+/g, "-");

function InteractiveRegion({
  region,
  selected,
  onSelect,
  onHover,
  children,
}: {
  region: BodyRegion;
  selected: boolean;
  onSelect: Select;
  onHover: Hover;
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
      className={`anatomy-region region-${slug(region)}${selected ? " is-selected" : ""}`}
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

interface LayerProps {
  selected: BodyRegion;
  onSelect: Select;
  onHover: Hover;
  view: View;
  clipId: string;
}

/* ------------------------------------------------------------------ */
/*  Stage: oval frame, light cone and base rings                       */
/* ------------------------------------------------------------------ */

const Defs = memo(function Defs({ uid }: { uid: string }) {
  return (
    <defs>
      <linearGradient id={`${uid}-body`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" className="stop-a" />
        <stop offset="1" className="stop-b" />
      </linearGradient>
      <linearGradient id={`${uid}-beam`} x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" className="beam-a" />
        <stop offset="1" className="beam-b" />
      </linearGradient>
      <radialGradient id={`${uid}-glow`} cx="50%" cy="50%" r="50%">
        <stop offset="0" className="glow-a" />
        <stop offset="1" className="glow-b" />
      </radialGradient>
      <clipPath id={`${uid}-clip`}>
        <path d={OUTLINE} />
      </clipPath>
    </defs>
  );
});

const Stage = memo(function Stage({ uid }: { uid: string }) {
  return (
    <g aria-hidden="true" className="holo-stage">
      <ellipse
        className="holo-glow"
        cx="260"
        cy="296"
        rx="244"
        ry="270"
        fill={`url(#${uid}-glow)`}
      />
      <ellipse className="holo-frame" cx="260" cy="296" rx="244" ry="270" />
      <ellipse
        className="holo-frame-inner"
        cx="260"
        cy="296"
        rx="230"
        ry="256"
      />
      <path
        className="holo-beam"
        d="M170 546L214 130H306L350 546Z"
        fill={`url(#${uid}-beam)`}
      />
      <ellipse
        className="holo-ring ring-1"
        cx="260"
        cy="547"
        rx="118"
        ry="13"
      />
      <ellipse className="holo-ring ring-2" cx="260" cy="547" rx="86" ry="9" />
      <ellipse className="holo-ring ring-3" cx="260" cy="547" rx="52" ry="5" />
    </g>
  );
});

function BodyBase({ view, uid }: { view: View; uid: string }) {
  return (
    <g className="anatomy-base" aria-hidden="true">
      <path className="body-fill" d={OUTLINE} fill={`url(#${uid}-body)`} />
      <g clipPath={`url(#${uid}-clip)`}>
        <rect className="scan-band" x="90" y="-40" width="220" height="40" />
      </g>
      <path className="body-outline" d={OUTLINE} />
      {view === "front" && (
        <path
          className="body-contour"
          d="M200 98V120M172 124Q200 134 228 124"
        />
      )}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/*  Muscles                                                            */
/* ------------------------------------------------------------------ */

function Muscles({ selected, onSelect, onHover, view, clipId }: LayerProps) {
  const torso = view === "front" ? FRONT_TORSO_MUSCLES : BACK_TORSO_MUSCLES;
  return (
    <InteractiveRegion
      region="Muscles"
      selected={selected === "Muscles"}
      onSelect={onSelect}
      onHover={onHover}
    >
      <g className="muscle-layer" clipPath={`url(#${clipId})`}>
        <Pair>
          {torso.map((d, i) => (
            <path key={`t${i}`} className="muscle" d={d} />
          ))}
          {LIMB_MUSCLES.map((d, i) => (
            <path key={`l${i}`} className="muscle" d={d} />
          ))}
        </Pair>
      </g>
    </InteractiveRegion>
  );
}

/* ------------------------------------------------------------------ */
/*  Skeleton                                                           */
/* ------------------------------------------------------------------ */

function Skeleton({ selected, onSelect, onHover, view }: LayerProps) {
  return (
    <InteractiveRegion
      region="Bones"
      selected={selected === "Bones"}
      onSelect={onSelect}
      onHover={onHover}
    >
      <g className="skeleton">
        {/* skull */}
        <path className="bone" d={SKULL} />
        {view === "front" ? (
          <>
            <ellipse className="bone" cx="192" cy="63" rx="6" ry="5" />
            <ellipse className="bone" cx="208" cy="63" rx="6" ry="5" />
            <path className="bone-line" d="M200 68l-2.5 7h5ZM191 80h18" />
          </>
        ) : (
          <path
            className="bone-line"
            d="M200 36V62M186 52Q200 46 214 52M190 70Q200 76 210 70"
          />
        )}

        {/* spine */}
        <path className="bone" d={VERTEBRAE} />
        <path className="bone" d={SACRUM} />

        {/* thorax */}
        <Pair>
          {RIBS.map((d, i) => (
            <path key={i} className="bone-line rib" d={d} />
          ))}
        </Pair>
        {view === "front" ? (
          <>
            <path className="bone" d={STERNUM} />
            <Pair>
              <path
                className="bone-line"
                d="M203 118C216 114 240 116 256 124"
              />
            </Pair>
          </>
        ) : (
          <Pair>
            <path className="bone" d={SCAPULA} />
          </Pair>
        )}

        {/* limbs and pelvis (mirrored) */}
        <Pair>
          <circle className="bone" cx="258" cy="132" r="5" />
          <path className="bone-line long-bone" d="M259 136L272 212" />
          <ellipse className="bone" cx="273" cy="214" rx="5" ry="4.5" />
          <path
            className="bone-line long-bone"
            d="M273 218L290 268M277 216L294 266"
          />
          <path
            className="bone-line"
            d="M289 272l5 34M294 272l7 26M285 272l-2 30"
          />

          <path className="bone" d={PELVIS} />
          <ellipse className="bone" cx="220" cy="280" rx="4.5" ry="6" />

          <circle className="bone" cx="231" cy="284" r="5.5" />
          <path className="bone-line long-bone" d="M232 288L224 402" />
          <ellipse className="bone" cx="223" cy="407" rx="7" ry="5.5" />
          <path
            className="bone-line long-bone"
            d="M222 413L219 494M228 414L225 490"
          />
          <path
            className="bone-line"
            d="M219 494L222 516M217 496L212 514M221 496L230 512"
          />
        </Pair>

        {/* wide, invisible hit targets */}
        <path className="bone-hit" d="M200 96V276" />
        <path className="bone-hit" d={RIBS.join("")} />
        <g>
          <Pair>
            <path
              className="bone-hit"
              d="M259 136L272 212L290 268M232 288L224 402L219 494"
            />
          </Pair>
        </g>
      </g>
    </InteractiveRegion>
  );
}

/* ------------------------------------------------------------------ */
/*  Organs, vessels, nervous system, senses                            */
/* ------------------------------------------------------------------ */

function Organs({ selected, onSelect, onHover, view }: LayerProps) {
  const is = (r: BodyRegion) => selected === r;
  const common = { onSelect, onHover };
  return (
    <g
      className="organ-layer"
      // A back view is a true mirror of the front organ layer.
      transform={view === "back" ? "translate(400 0) scale(-1 1)" : undefined}
    >
      {/* Digestive system */}
      <InteractiveRegion
        region="Digestive system"
        selected={is("Digestive system")}
        {...common}
      >
        <path
          className="organ-line esophagus"
          d="M203 100V198C204 200 207 201 210 202"
        />
        <path
          className="organ liver"
          d="M164 204C174 196 196 196 214 204C212 216 202 228 186 230C172 228 162 216 164 204Z"
        />
        <path
          className="organ stomach"
          d="M210 198C224 194 240 200 240 214C240 228 226 234 216 228C220 220 214 214 210 210Z"
        />
        <path
          className="gut gut-large"
          d="M174 264V238Q174 232 180 232H220Q226 232 226 238V258Q226 270 212 268"
        />
        <path
          className="gut gut-small"
          d="M184 240q16-6 32 0t-32 7t32 7t-32 7"
        />
      </InteractiveRegion>

      {/* Kidneys / urinary system */}
      <InteractiveRegion
        region="Kidneys / urinary system"
        selected={is("Kidneys / urinary system")}
        {...common}
      >
        <Pair>
          <path className="organ kidney" d={KIDNEY} />
          <path className="organ-line adrenal" d="M223 201q5-5 10-1" />
          <path
            className="organ-line ureter"
            d="M225 240C222 252 214 262 205 270"
          />
        </Pair>
        <path
          className="organ bladder"
          d="M190 277C190 268 210 268 210 277C212 289 188 289 190 277Z"
        />
      </InteractiveRegion>

      {/* Lungs and airway */}
      <InteractiveRegion region="Lungs" selected={is("Lungs")} {...common}>
        <Pair>
          <path className="organ lung" d={LUNG} />
          <path
            className="organ-detail"
            d="M208 134C214 142 220 150 224 164M214 176C224 178 232 176 238 170"
          />
        </Pair>
        <path className="organ trachea" d="M197 98h6v30h-6Z" />
        <path
          className="organ-line airway"
          d="M200 128C192 136 188 144 184 156M200 128C208 136 212 144 216 156"
        />
      </InteractiveRegion>

      {/* Blood vessels (drawn above lungs, below the heart) */}
      <InteractiveRegion region="Blood" selected={is("Blood")} {...common}>
        <path
          className="vessel artery"
          d="M214 152C214 140 206 134 204 138C203 150 204 180 204 256"
        />
        <path
          className="vessel vein"
          d="M197 150C197 135 197 105 196 90M197 150V254"
        />
        <Pair>
          <path className="vessel artery" d={NECK_ARTERY} />
          <path
            className="vessel vein"
            d={NECK_ARTERY}
            transform="translate(-9 0)"
          />
          <path className="vessel artery" d={ARM_ARTERY} />
          <path
            className="vessel vein"
            d={ARM_ARTERY}
            transform="translate(5 3)"
          />
          <path className="vessel artery" d={LEG_ARTERY} />
          <path
            className="vessel vein"
            d={LEG_ARTERY}
            transform="translate(7 0)"
          />
          <path className="vessel-hit" d={`${ARM_ARTERY}${LEG_ARTERY}`} />
        </Pair>
        <path className="vessel-hit" d="M204 138V256" />
      </InteractiveRegion>

      {/* Heart */}
      <InteractiveRegion region="Heart" selected={is("Heart")} {...common}>
        <path
          className="organ heart"
          d="M216 152C210 145 201 148 201 158C202 170 211 180 217 188C225 180 233 170 232 158C231 148 223 146 216 152Z"
        />
        <path
          className="organ-detail"
          d="M216 152C214 144 222 138 228 142M218 156C216 166 220 176 226 180"
        />
      </InteractiveRegion>

      {/* Brain, brainstem and spinal cord */}
      <InteractiveRegion region="Brain" selected={is("Brain")} {...common}>
        <path className="cord" d="M200 57C200 70 200 85 200 100V254" />
        <path
          className="organ brain"
          d="M183 55C181 41 188 35 200 35C212 35 219 41 217 55C216 59 212 60 208 57C204 55 196 55 192 57C188 60 184 59 183 55Z"
        />
        <path
          className="organ-detail"
          d="M188 44c5-5 11-2 12 2c3-5 9-6 14-1M186 51c5-3 9 0 12 3m6-2c3-4 9-4 12 0M194 39c3 3 7 3 9 0"
        />
      </InteractiveRegion>

      {/* Eyes */}
      <InteractiveRegion region="Eyes" selected={is("Eyes")} {...common}>
        <Pair>
          <path
            className="organ eye"
            d="M202.5 63q5.5-5.5 11 0q-5.5 5.5-11 0Z"
          />
          <circle className="pupil" cx="208" cy="63" r="2.2" />
        </Pair>
      </InteractiveRegion>

      {/* Inner ear and balance */}
      <InteractiveRegion
        region="Inner ear and balance"
        selected={is("Inner ear and balance")}
        {...common}
      >
        <Pair>
          <path
            className="organ ear"
            d="M219 56C227 54 230 65 225 72C223 75 220 74 220 71Z"
          />
          <path
            className="organ-detail"
            d="M224 60c2-1 3 2 1 3M222 66c2 0 3 3 0 4"
          />
        </Pair>
      </InteractiveRegion>
    </g>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function AnatomyMap({
  selected,
  onSelect,
  view,
}: AnatomyMapProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const [hovered, setHovered] = useState<BodyRegion | null>(null);

  const active = hovered ?? selected;
  const spec = CALLOUTS[active];
  const mirrored = view === "back";
  const ax = mirrored ? 2 * CX - spec.anchor[0] : spec.anchor[0];
  const ay = spec.anchor[1];
  const side: "left" | "right" = mirrored
    ? spec.side === "left"
      ? "right"
      : "left"
    : spec.side;

  const px = ((ax + OX) / VB_W) * 100;
  const py = ((ay + OY) / VB_H) * 100;
  const kicker = hovered && hovered !== selected ? "Preview" : "Selected";

  const layer: LayerProps = {
    selected,
    onSelect,
    onHover: setHovered,
    view,
    clipId: `${uid}-clip`,
  };

  return (
    <div className="anatomy-map-wrap">
      <svg
        className={`anatomy-map anatomy-view-${view} is-${view === "front" ? "front" : "back"}`}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMid meet"
        role="group"
        aria-labelledby={`${uid}-title ${uid}-desc`}
      >
        <title id={`${uid}-title`}>
          {view === "front" ? "Anterior" : "Posterior"} anatomy schematic
        </title>
        <desc id={`${uid}-desc`}>
          Original schematic anatomy with 11 selectable regions: brain, eyes,
          inner ear and balance, lungs, heart, blood vessels, digestive system,
          kidneys and urinary system, bones, muscles and skin. Motion is
          illustrative and is not measured telemetry.
        </desc>

        <Defs uid={uid} />
        <Stage uid={uid} />

        <g transform={`translate(${OX} ${OY})`}>
          <BodyBase view={view} uid={uid} />
          <Muscles {...layer} />
          <Skeleton {...layer} />
          <Organs {...layer} />

          {/* Skin: soft band along the silhouette edge */}
          <InteractiveRegion
            region="Skin"
            selected={selected === "Skin"}
            onSelect={onSelect}
            onHover={setHovered}
          >
            <path className="skin-hit" d={OUTLINE} />
          </InteractiveRegion>
        </g>

        <g aria-hidden="true" className="callout-marker">
          <circle className="callout-halo" cx={ax + OX} cy={ay + OY} r="7" />
          <circle className="callout-dot" cx={ax + OX} cy={ay + OY} r="3" />
        </g>
      </svg>

      {/* Callout: HTML overlay so text stays crisp, theme-aware and unclipped */}
      <div
        className={`anatomy-callout callout-${side}`}
        style={
          side === "left"
            ? { top: `${py}%`, left: 0, width: `${px}%` }
            : { top: `${py}%`, left: `${px}%`, width: `${100 - px}%` }
        }
        aria-hidden="true"
      >
        {side === "right" && <span className="callout-line" />}
        <span className="callout-chip">
          <span className="callout-kicker">{kicker}</span>
          <span className="callout-name">{active}</span>
        </span>
        {side === "left" && <span className="callout-line" />}
      </div>

      {/* Compact caption used instead of the leader on very narrow screens */}
      <div className="callout-caption" aria-hidden="true">
        <span className="callout-kicker">{kicker}</span>
        <span className="callout-name">{active}</span>
      </div>
    </div>
  );
}

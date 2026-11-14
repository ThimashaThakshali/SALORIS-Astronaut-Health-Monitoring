import { motion } from "motion/react";
import {
  AlertTriangle,
  Check,
  Droplets,
  Gauge,
  HeartPulse,
  Info,
  Thermometer,
  Wind,
  Moon,
  type LucideIcon,
} from "lucide-react";

import type { HealthReading } from "../../data";

// Selects an icon based on the type of health measurement.
const iconMap: Record<HealthReading["icon"], LucideIcon> = {
  heart: HeartPulse,
  pressure: Gauge,
  glucose: Droplets,
  temperature: Thermometer,
  oxygen: Wind,
  sleep: Moon,
};

interface ReadingCardProps {
  reading: HealthReading;
  index: number;
}

// Displays one health measurement and its assessment status.
export function ReadingCard({ reading, index }: ReadingCardProps) {
  const Icon = iconMap[reading.icon];

  return (
    <motion.article
      className="reading-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.045 }}
    >
      <div className="reading-top">
        <span className="metric-icon">
          <Icon size={18} />
        </span>

        <span
          className={`status status-${reading.status.toLowerCase().replace(" ", "-")}`}
        >
          {reading.status === "Attention" ? (
            <AlertTriangle size={12} />
          ) : reading.status === "Insufficient data" ? (
            <Info size={12} />
          ) : (
            <Check size={12} />
          )}

          {reading.status}
        </span>
      </div>

      <div className="metric-label">{reading.label}</div>

      <div className="metric-value">
        {reading.value} <span>{reading.unit}</span>
      </div>

      <div className="metric-meta">
        <span>{reading.method}</span>
        <span>
          {reading.source} · {reading.timestamp}
        </span>
      </div>

      {reading.simulated && (
        <span className="simulation-label">SIMULATED · NOT VERIFIED</span>
      )}
    </motion.article>
  );
}

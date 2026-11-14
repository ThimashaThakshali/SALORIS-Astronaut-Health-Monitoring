import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { trendData } from "../../data";

interface TrendChartProps {
  mode?: "area" | "line";
}

// Displays health trends using either an area chart or a line chart.
export function TrendChart({ mode = "area" }: TrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      {mode === "area" ? (
        <AreaChart
          data={trendData}
          margin={{ top: 12, right: 4, left: -25, bottom: 0 }}
        >
          <defs>
            <linearGradient id="trend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#28d9c2" stopOpacity=".32" />
              <stop offset="100%" stopColor="#28d9c2" stopOpacity="0" />
            </linearGradient>
          </defs>

          <CartesianGrid
            stroke="var(--chart-grid)"
            vertical={false}
            strokeDasharray="3 5"
          />

          <XAxis
            dataKey="day"
            stroke="var(--chart-axis)"
            tickLine={false}
            axisLine={false}
            fontSize={11}
          />

          <YAxis
            domain={[60, 80]}
            stroke="var(--chart-axis)"
            tickLine={false}
            axisLine={false}
            fontSize={11}
          />

          <Tooltip
            contentStyle={{
              background: "var(--chart-tooltip)",
              border: "1px solid var(--chart-tooltip-border)",
              borderRadius: 10,
            }}
          />

          <Area
            type="monotone"
            dataKey="heart"
            stroke="#28d9c2"
            strokeWidth={2.5}
            fill="url(#trend)"
          />
        </AreaChart>
      ) : (
        <LineChart
          data={trendData}
          margin={{ top: 12, right: 8, left: -25, bottom: 0 }}
        >
          <CartesianGrid
            stroke="var(--chart-grid)"
            vertical={false}
            strokeDasharray="3 5"
          />

          <XAxis
            dataKey="day"
            stroke="var(--chart-axis)"
            tickLine={false}
            axisLine={false}
            fontSize={11}
          />

          <YAxis
            stroke="var(--chart-axis)"
            tickLine={false}
            axisLine={false}
            fontSize={11}
          />

          <Tooltip
            contentStyle={{
              background: "var(--chart-tooltip)",
              border: "1px solid var(--chart-tooltip-border)",
              borderRadius: 10,
            }}
          />

          <Line
            type="monotone"
            dataKey="sleep"
            stroke="#70a7ff"
            strokeWidth={2.5}
            dot={{ fill: "#70a7ff", r: 3 }}
          />

          <Line
            type="monotone"
            dataKey="stress"
            stroke="#f4b860"
            strokeWidth={2.5}
            dot={{ fill: "#f4b860", r: 3 }}
          />
        </LineChart>
      )}
    </ResponsiveContainer>
  );
}

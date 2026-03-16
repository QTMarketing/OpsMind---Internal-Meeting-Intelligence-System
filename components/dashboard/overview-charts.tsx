"use client";

import { type KeyboardEvent, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ChartPoint = {
  date: string;
  dateKey: string;
  [key: string]: string | number;
};

type OverviewChartsProps = {
  taskTrendData: ChartPoint[];
  meetingVolumeData: ChartPoint[];
  selectedDueDate: string | null;
  onTaskTrendPointSelect: (dateKey: string) => void;
  onMeetingVolumeSelect: (dateKey: string) => void;
};

type InteractiveLineDotProps = {
  cx?: number;
  cy?: number;
  payload?: ChartPoint;
};

type InteractiveBarShapeProps = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: ChartPoint;
  fill?: string;
};

function getTopRoundedBarPath(x: number, y: number, width: number, height: number, radius: number) {
  const r = Math.max(0, Math.min(radius, width / 2, height));
  const bottomY = y + height;
  const rightX = x + width;

  return [
    `M ${x} ${bottomY}`,
    `L ${x} ${y + r}`,
    `Q ${x} ${y} ${x + r} ${y}`,
    `L ${rightX - r} ${y}`,
    `Q ${rightX} ${y} ${rightX} ${y + r}`,
    `L ${rightX} ${bottomY}`,
    "Z",
  ].join(" ");
}

export function OverviewCharts({
  taskTrendData,
  meetingVolumeData,
  selectedDueDate,
  onTaskTrendPointSelect,
  onMeetingVolumeSelect,
}: OverviewChartsProps) {
  const [focusedTaskDate, setFocusedTaskDate] = useState<string | null>(null);
  const [focusedMeetingDate, setFocusedMeetingDate] = useState<string | null>(null);
  const axisTick = { fill: "var(--foreground)", fontSize: 12 };
  const tooltipStyle = {
    backgroundColor: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "0.5rem",
    padding: "0.5rem 0.625rem",
    color: "var(--foreground)",
  };

  function handleChartKeyboardActivation(event: KeyboardEvent<SVGElement>, callback: () => void) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      callback();
    }
  }

  return (
    <section className="grid gap-4 xl:grid-cols-2">
      <article className="app-card p-5">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Task Due Trend</h2>
        <p className="mb-2 text-xs text-muted">Click a point to filter tasks by due date</p>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={taskTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={axisTick} />
              <YAxis allowDecimals={false} tick={axisTick} />
              <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "var(--foreground)", fontWeight: 600 }} />
              <Line
                type="monotone"
                dataKey="due"
                stroke="var(--accent)"
                strokeWidth={2}
                dot={({ cx, cy, payload }: InteractiveLineDotProps) => {
                  if (typeof cx !== "number" || typeof cy !== "number" || !payload?.dateKey) return null;
                  const isSelected = selectedDueDate === payload.dateKey;
                  const isFocused = focusedTaskDate === payload.dateKey;
                  const showHalo = isSelected || isFocused;

                  return (
                    <g
                      role="button"
                      tabIndex={0}
                      aria-label={`Filter tasks due on ${payload.date}`}
                      onClick={() => onTaskTrendPointSelect(payload.dateKey)}
                      onKeyDown={(event) =>
                        handleChartKeyboardActivation(event, () => onTaskTrendPointSelect(payload.dateKey))
                      }
                      onFocus={() => setFocusedTaskDate(payload.dateKey)}
                      onBlur={() => setFocusedTaskDate(null)}
                      style={{ cursor: "pointer" }}
                    >
                      {showHalo ? (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={8}
                          fill="transparent"
                          stroke="var(--accent)"
                          strokeOpacity={isSelected ? 0.5 : 0.35}
                          strokeWidth={2}
                        />
                      ) : null}
                      <circle cx={cx} cy={cy} r={3.5} fill="var(--accent)" />
                    </g>
                  );
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="app-card p-5">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Meeting Activity Volume</h2>
        <p className="mb-2 text-xs text-muted">Click a bar to open meetings for that date</p>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={meetingVolumeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={axisTick} />
              <YAxis allowDecimals={false} tick={axisTick} />
              <Tooltip
                cursor={{ fill: "var(--surface-muted)", fillOpacity: 0.45 }}
                contentStyle={tooltipStyle}
                labelStyle={{ color: "var(--foreground)", fontWeight: 600 }}
              />
              <Bar
                dataKey="tasks"
                fill="var(--accent)"
                radius={[6, 6, 0, 0]}
                shape={({ x, y, width, height, payload, fill }: InteractiveBarShapeProps) => {
                  if (
                    typeof x !== "number" ||
                    typeof y !== "number" ||
                    typeof width !== "number" ||
                    typeof height !== "number" ||
                    !payload?.dateKey
                  ) {
                    return null;
                  }

                  const isFocused = focusedMeetingDate === payload.dateKey;
                  return (
                    <g
                      role="button"
                      tabIndex={0}
                      aria-label={`Open meetings from ${payload.date}`}
                      onClick={() => onMeetingVolumeSelect(payload.dateKey)}
                      onKeyDown={(event) =>
                        handleChartKeyboardActivation(event, () => onMeetingVolumeSelect(payload.dateKey))
                      }
                      onFocus={() => setFocusedMeetingDate(payload.dateKey)}
                      onBlur={() => setFocusedMeetingDate(null)}
                      style={{ cursor: "pointer" }}
                    >
                      {isFocused ? (
                        <rect
                          x={x - 2}
                          y={y - 2}
                          width={width + 4}
                          height={height + 4}
                          fill="transparent"
                          stroke="var(--accent)"
                          strokeOpacity={0.4}
                          strokeWidth={2}
                          rx={8}
                          ry={8}
                        />
                      ) : null}
                      <path d={getTopRoundedBarPath(x, y, width, height, 6)} fill={fill} />
                    </g>
                  );
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>
    </section>
  );
}

import { useState } from "react";
import type { CSSProperties } from "react";
import {
  Bone,
  Check,
  ChevronDown,
  Droplets,
  Dumbbell,
  Moon,
  Stethoscope,
  Utensils,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { PageHeader } from "../../components/common/PageHeader";
import { Panel } from "../../components/common/Panel";

// Describes the information needed for each daily task.
interface Task {
  icon: LucideIcon;
  label: string;
  description: string;
}

// Displays the daily health checklist and mission progress.
export function Tasks() {
  // Stores whether each task has been completed.
  const [done, setDone] = useState([true, true, false, false, false]);

  // The tasks shown in today's mission plan.
  const tasks: Task[] = [
    {
      icon: Dumbbell,
      label: "Resistance exercise",
      description: "45 min · before 13:00",
    },
    {
      icon: Droplets,
      label: "Hydration target",
      description: "2.0 of 2.5 L",
    },
    {
      icon: Utensils,
      label: "Nutrition log",
      description: "Log midday meal",
    },
    {
      icon: Moon,
      label: "Sleep preparation",
      description: "Begin at 21:30",
    },
    {
      icon: Stethoscope,
      label: "Evening measurements",
      description: "HR · BP · symptoms",
    },
  ];

  // Counts how many tasks have been completed.
  const completedCount = done.filter(Boolean).length;

  // Calculates the percentage of completed tasks.
  const progress = Math.round((completedCount / tasks.length) * 100);

  // Changes the completion status of one selected task.
  function toggleTask(index: number) {
    setDone((previousTasks) =>
      previousTasks.map((isDone, taskIndex) =>
        taskIndex === index ? !isDone : isDone,
      ),
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Mission day 184"
        title="Daily health tasks"
        description="Small, consistent actions protect performance and make changes easier to notice."
        action={
          <div className="streak">
            <Zap size={17} /> 12 day streak
          </div>
        }
      />

      <div className="task-progress">
        <div>
          <span className="eyebrow">Today's progress</span>
          <strong>
            {completedCount}
            <small> / {tasks.length} complete</small>
          </strong>
        </div>

        <div
          className="ring"
          style={
            {
              "--progress": `${(completedCount / tasks.length) * 360}deg`,
            } as CSSProperties
          }
        >
          <span>{progress}%</span>
        </div>

        <div>
          <b>Keep your rhythm</b>
          <p>
            Complete {tasks.length - completedCount} more tasks to close today's
            health plan.
          </p>
        </div>
      </div>

      <div className="tasks-layout">
        <Panel>
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Schedule</span>
              <h2>Today's plan</h2>
            </div>

            <span>Local mission time</span>
          </div>

          <div className="task-list">
            {tasks.map((task, index) => {
              const Icon = task.icon;

              return (
                <button
                  className={done[index] ? "done" : ""}
                  onClick={() => toggleTask(index)}
                  key={task.label}
                >
                  <span className="task-check">
                    {done[index] && <Check size={15} />}
                  </span>

                  <span className="task-icon">
                    <Icon size={18} />
                  </span>

                  <span>
                    <b>{task.label}</b>
                    <small>{task.description}</small>
                  </span>

                  <ChevronDown size={16} />
                </button>
              );
            })}
          </div>
        </Panel>

        <Panel>
          <span className="eyebrow">Weekly mission</span>
          <h2>Countermeasure consistency</h2>

          <div className="week-grid">
            {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
              <span
                className={index < 5 ? "complete" : index === 5 ? "today" : ""}
                key={index}
              >
                {day}

                <i>{index < 5 ? <Check size={13} /> : index + 1}</i>
              </span>
            ))}
          </div>

          <div className="achievement">
            <Bone />

            <div>
              <b>Steady foundation</b>
              <p>5 days of exercise and nutrition consistency.</p>
            </div>
          </div>

          <div className="points">
            <span>Weekly health points</span>

            <strong>
              840 <small>/ 1,000</small>
            </strong>

            <i>
              <b />
            </i>
          </div>
        </Panel>
      </div>
    </>
  );
}

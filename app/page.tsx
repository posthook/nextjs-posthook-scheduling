import { listTasks } from "@/lib/store";
import { Poller } from "@/components/poller";
import { StatusBadge } from "@/components/status-badge";
import { Countdown } from "@/components/countdown";
import { LocalTime } from "@/components/local-time";
import { CreateForm } from "./create-form";
import { MarkDoneButton } from "./mark-done-button";
import { ClockIcon } from "lucide-react";
import type { Task } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const tasks = await listTasks();

  return (
    <>
      <Poller />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14 flex-1">
        {/* Hero header */}
        <header className="text-center mb-10">
          <div className="inline-block pastel-lavender border-2 border-foreground rounded-full px-4 py-1 text-xs font-bold uppercase tracking-wider mb-4">
            Posthook + Next.js Starter
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">
            Schedule Jobs in Next.js
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            One API call schedules a webhook. Your route handler runs when the time comes.
            No cron. No queues. No workflow engines.
          </p>
        </header>

        {/* Create form */}
        <div className="mb-8 max-w-lg mx-auto">
          <CreateForm />
        </div>

        {/* Task list */}
        {tasks.length === 0 ? (
          <div className="comic-card p-10 text-center">
            <ClockIcon className="size-8 mx-auto mb-3 text-muted-foreground" strokeWidth={1.5} />
            <p className="text-sm font-bold mb-1">No reminders yet</p>
            <p className="text-xs text-muted-foreground">
              Schedule one above to see Posthook in action.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-14 pt-6 border-t-2 border-foreground/10 text-center text-xs text-muted-foreground">
          Built with{" "}
          <a href="https://posthook.io?utm_source=nextjs-posthook-scheduling&utm_medium=template&utm_campaign=vercel" className="font-bold text-foreground hover:underline">
            Posthook
          </a>{" "}
          &middot;{" "}
          <a
            href="https://github.com/posthook/nextjs-posthook-scheduling"
            className="font-bold text-foreground hover:underline"
          >
            View source
          </a>
        </footer>
      </div>
    </>
  );
}

function TaskCard({ task }: { task: Task }) {
  const isDone = task.status === "done";

  return (
    <div className={`comic-card animate-slide-up p-4 ${isDone ? "opacity-60" : ""}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <StatusBadge status={task.status} />
          <span className="text-sm font-bold">{task.description}</span>
        </div>
        {!isDone && <MarkDoneButton taskId={task.id} />}
      </div>

      {/* Timestamps */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px]">
        <Stamp label="Scheduled">
          <LocalTime iso={task.createdAt} showSeconds />
        </Stamp>
        {task.remindAt && task.status === "pending" && (
          <Stamp label="Fires in" highlight>
            <Countdown target={task.remindAt} />
          </Stamp>
        )}
        {task.remindAt && task.status !== "pending" && (
          <Stamp label="Scheduled for">
            <LocalTime iso={task.remindAt} showSeconds />
          </Stamp>
        )}
        {task.remindedAt && (
          <Stamp label="Fired">
            <LocalTime iso={task.remindedAt} showSeconds />
          </Stamp>
        )}
        {task.doneAt && (
          <Stamp label="Done">
            <LocalTime iso={task.doneAt} showSeconds />
          </Stamp>
        )}
      </div>
    </div>
  );
}

function Stamp({ label, highlight, children }: { label: string; highlight?: boolean; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-mono font-semibold ${highlight ? "text-foreground" : ""}`}>
        {children}
      </span>
    </span>
  );
}

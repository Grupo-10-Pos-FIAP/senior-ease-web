import type { Task } from "@domain/entities/Task";

const DEADLINE_BADGE_MAX_DAYS = 7;

export type TaskDeadlineBadgeTone = "today" | "upcoming" | "week";

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getCalendarDaysUntil(isoDate: string, referenceDate: Date = new Date()): number {
  const target = startOfLocalDay(new Date(`${isoDate}T00:00:00`));
  const today = startOfLocalDay(referenceDate);
  const msPerDay = 24 * 60 * 60 * 1000;

  return Math.round((target.getTime() - today.getTime()) / msPerDay);
}

export function getTaskDeadlineBadgeLabel(
  endDate: string,
  referenceDate: Date = new Date(),
): string | null {
  const daysUntil = getCalendarDaysUntil(endDate, referenceDate);

  if (daysUntil < 0 || daysUntil > DEADLINE_BADGE_MAX_DAYS) {
    return null;
  }

  if (daysUntil === 0) {
    return "Prazo termina hoje";
  }

  if (daysUntil === 1) {
    return "Prazo termina daqui 1 dia";
  }

  return `Prazo termina daqui ${String(daysUntil)} dias`;
}

export function getTaskDeadlineBadgeTone(
  endDate: string,
  referenceDate: Date = new Date(),
): TaskDeadlineBadgeTone | null {
  const daysUntil = getCalendarDaysUntil(endDate, referenceDate);

  if (daysUntil < 0 || daysUntil > DEADLINE_BADGE_MAX_DAYS) {
    return null;
  }

  if (daysUntil === 0) {
    return "today";
  }

  if (daysUntil === 7) {
    return "week";
  }

  return "upcoming";
}

export function sortActiveTasksByDeadline(tasks: Task[]): Task[] {
  return [...tasks].sort((left, right) => {
    if (left.endDate !== right.endDate) {
      return left.endDate.localeCompare(right.endDate);
    }

    return left.title.localeCompare(right.title, "pt-BR");
  });
}

import { createTaskStepType, type TaskStepType } from "@domain/value-objects/TaskStepType";

export type CatalogActivityStatus = "active" | "expired";

export interface ActivityStep {
  id: string;
  label: string;
  type: TaskStepType;
  order: number;
}

export interface Activity {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  status: CatalogActivityStatus;
  steps: ActivityStep[];
}

const CATALOG_STATUSES: CatalogActivityStatus[] = ["active", "expired"];
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isValidIsoDate(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime());
}

function createActivityStep(
  input: Partial<ActivityStep> & Pick<ActivityStep, "id" | "label" | "order" | "type">,
): ActivityStep {
  return {
    id: input.id,
    label: input.label.trim(),
    type: createTaskStepType(input.type),
    order: input.order,
  };
}

export function createActivity(input: {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  status: CatalogActivityStatus;
  steps?: ActivityStep[];
}): Activity {
  const title = input.title.trim();
  if (!title) {
    throw new Error("Título da atividade é obrigatório");
  }

  if (!isValidIsoDate(input.startDate) || !isValidIsoDate(input.endDate)) {
    throw new Error("Datas da atividade devem estar no formato YYYY-MM-DD");
  }

  if (input.startDate > input.endDate) {
    throw new Error("Data inicial não pode ser posterior à data final");
  }

  if (!CATALOG_STATUSES.includes(input.status)) {
    throw new Error("Status do catálogo inválido");
  }

  return {
    id: input.id,
    title,
    startDate: input.startDate,
    endDate: input.endDate,
    status: input.status,
    steps: (input.steps ?? []).map((step) => createActivityStep(step)),
  };
}

import { createActivity, type Activity } from "@domain/entities/Activity";
import { createActivityProgress, type ActivityProgress } from "@domain/entities/ActivityProgress";
import { createCourse, type Course } from "@domain/entities/Course";
import {
  createTaskStepType,
  DEFAULT_TASK_STEP_TYPE,
  type TaskStepType,
} from "@domain/value-objects/TaskStepType";
import type { CatalogActivityStatus } from "@domain/entities/Activity";
import type { ActivityStepContent } from "@domain/value-objects/ActivityStepContent";

export interface ActivityStepDto {
  id: string;
  label: string;
  type?: TaskStepType;
  order: number;
  content?: ActivityStepContent;
}

export interface ActivityDto {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  status: CatalogActivityStatus;
  steps: ActivityStepDto[];
}

export interface ActivityProgressDto {
  activityId: string;
  status: "active" | "completed";
  completedStepIds: string[];
  completedGuideStepIds?: string[];
  startedAt?: string;
  currentStepId?: string;
  stepAnswers?: Record<string, string>;
}

export interface CourseDto {
  id: string;
  title: string;
}

export function fromActivityDto(dto: ActivityDto): Activity {
  return createActivity({
    id: dto.id,
    title: dto.title,
    startDate: dto.startDate,
    endDate: dto.endDate,
    status: dto.status,
    steps: dto.steps.map((step) => ({
      id: step.id,
      label: step.label,
      type: step.type ? createTaskStepType(step.type) : DEFAULT_TASK_STEP_TYPE,
      order: step.order,
      content: step.content,
    })),
  });
}

export function toActivityDto(activity: Activity): ActivityDto {
  return {
    id: activity.id,
    title: activity.title,
    startDate: activity.startDate,
    endDate: activity.endDate,
    status: activity.status,
    steps: activity.steps.map((step) => ({
      id: step.id,
      label: step.label,
      type: step.type,
      order: step.order,
      content: step.content,
    })),
  };
}

export function fromActivityProgressDto(dto: ActivityProgressDto): ActivityProgress {
  return createActivityProgress({
    activityId: dto.activityId,
    status: dto.status,
    completedStepIds: dto.completedStepIds,
    completedGuideStepIds: dto.completedGuideStepIds,
    startedAt: dto.startedAt,
    currentStepId: dto.currentStepId,
    stepAnswers: dto.stepAnswers,
  });
}

export function toActivityProgressDto(progress: ActivityProgress): ActivityProgressDto {
  const dto: ActivityProgressDto = {
    activityId: progress.activityId,
    status: progress.status,
    completedStepIds: [...progress.completedStepIds],
    completedGuideStepIds: [...progress.completedGuideStepIds],
  };

  if (progress.startedAt !== undefined) {
    dto.startedAt = progress.startedAt;
  }

  if (progress.currentStepId !== undefined) {
    dto.currentStepId = progress.currentStepId;
  }

  if (progress.stepAnswers !== undefined) {
    dto.stepAnswers = { ...progress.stepAnswers };
  }

  return dto;
}

export function fromCourseDto(dto: CourseDto): Course {
  return createCourse({ id: dto.id, title: dto.title });
}

export function toCourseDto(course: Course): CourseDto {
  return { id: course.id, title: course.title };
}

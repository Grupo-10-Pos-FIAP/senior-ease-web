export interface MultipleChoiceOption {
  id: string;
  label: string;
}

export type ActivityStepContent =
  | { kind: "content_reading"; body: string }
  | { kind: "watch_content"; videoUrl: string }
  | {
      kind: "multiple_choice";
      question: string;
      options: MultipleChoiceOption[];
    }
  | { kind: "open_question"; question: string };

export interface StepCompletionPayload {
  answer?: string;
}

export function canCompleteStepContent(
  content: ActivityStepContent | undefined,
  payload?: StepCompletionPayload,
): boolean {
  if (!content) {
    return true;
  }

  switch (content.kind) {
    case "content_reading":
    case "watch_content":
      return true;
    case "multiple_choice":
      return typeof payload?.answer === "string" && payload.answer.trim().length > 0;
    case "open_question":
      return typeof payload?.answer === "string" && payload.answer.trim().length >= 3;
    default:
      return false;
  }
}

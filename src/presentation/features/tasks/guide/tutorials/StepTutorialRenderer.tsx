import type { TaskStepType } from "@domain/value-objects/TaskStepType";
import { ContentReadingTutorial } from "./ContentReadingTutorial";
import { MultipleChoiceTutorial } from "./MultipleChoiceTutorial";
import { OpenQuestionTutorial } from "./OpenQuestionTutorial";
import { WatchContentTutorial } from "./WatchContentTutorial";
import type { StepTutorialProps } from "./types";

interface StepTutorialRendererProps extends StepTutorialProps {
  type: TaskStepType;
}

export function StepTutorialRenderer({
  type,
  stepLabel,
  backToTasksPath,
  onCanCompleteChange,
}: StepTutorialRendererProps) {
  const sharedProps = { stepLabel, backToTasksPath, onCanCompleteChange };

  switch (type) {
    case "multiple_choice":
      return <MultipleChoiceTutorial {...sharedProps} />;
    case "open_question":
      return <OpenQuestionTutorial {...sharedProps} />;
    case "content_reading":
      return <ContentReadingTutorial {...sharedProps} />;
    case "watch_content":
      return <WatchContentTutorial {...sharedProps} />;
    default:
      return null;
  }
}

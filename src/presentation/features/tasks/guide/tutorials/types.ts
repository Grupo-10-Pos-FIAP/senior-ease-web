export interface StepTutorialProps {
  stepLabel: string;
  backToTasksPath?: string;
  onCanCompleteChange?: (canComplete: boolean) => void;
}

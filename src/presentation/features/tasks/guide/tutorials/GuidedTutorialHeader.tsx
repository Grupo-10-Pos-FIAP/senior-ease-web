import { BackToTasksLink } from "../BackToTasksLink";

interface GuidedTutorialHeaderProps {
  hint: string;
  backToTasksPath?: string;
}

export function GuidedTutorialHeader({ hint, backToTasksPath }: GuidedTutorialHeaderProps) {
  return (
    <div className="immersive-tutorial__header">
      <p className="immersive-tutorial__hint">{hint}</p>
      {backToTasksPath ? (
        <BackToTasksLink to={backToTasksPath} className="immersive-tutorial__back" />
      ) : null}
    </div>
  );
}

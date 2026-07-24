interface GuidedTutorialHeaderProps {
  hint: string;
}

export function GuidedTutorialHeader({ hint }: GuidedTutorialHeaderProps) {
  return (
    <div className="immersive-tutorial__header">
      <p className="immersive-tutorial__hint">{hint}</p>
    </div>
  );
}

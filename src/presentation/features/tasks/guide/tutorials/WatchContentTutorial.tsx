import { useState } from "react";
import type { StepTutorialProps } from "./types";
import { GuidedTutorialHeader } from "./GuidedTutorialHeader";

export function WatchContentTutorial({ stepLabel, backToTasksPath }: StepTutorialProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  function handlePlay() {
    if (isPlaying && progress >= 100) {
      setProgress(0);
    }
    setIsPlaying(true);

    const interval = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 100) {
          window.clearInterval(interval);
          return 100;
        }
        return current + 10;
      });
    }, 400);
  }

  return (
    <article className="immersive-tutorial" aria-labelledby="video-tutorial-title">
      <GuidedTutorialHeader
        backToTasksPath={backToTasksPath}
        hint="Assista ao vídeo com calma. Use o botão de play para começar e ajuste o volume se precisar."
      />

      <div className="immersive-tutorial__content immersive-tutorial__content--video">
        <h2 id="video-tutorial-title" className="immersive-tutorial__title">
          {stepLabel}
        </h2>

        <div className="immersive-tutorial__video" aria-label="Simulação de player de vídeo">
          <div className="immersive-tutorial__video-screen">
            {!isPlaying || progress < 100 ? (
              <button
                type="button"
                className="immersive-tutorial__play-button"
                onClick={handlePlay}
                aria-label={isPlaying ? "Reproduzindo vídeo" : "Reproduzir vídeo de exemplo"}
              >
                ▶
              </button>
            ) : (
              <span className="immersive-tutorial__video-done" aria-hidden="true">
                ✓
              </span>
            )}
          </div>

          {isPlaying ? (
            <div
              className="immersive-tutorial__progress"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Progresso do vídeo"
            >
              <div
                className="immersive-tutorial__progress-bar"
                style={{ width: `${String(progress)}%` }}
              />
            </div>
          ) : null}
        </div>

        <p className="immersive-tutorial__video-tip">
          Na atividade real, você pode pausar, voltar e ajustar o volume pelos controles do vídeo.
        </p>
      </div>
    </article>
  );
}

import type { StepTutorialProps } from "./types";
import { GuidedTutorialHeader } from "./GuidedTutorialHeader";

export function ContentReadingTutorial({ stepLabel, backToTasksPath }: StepTutorialProps) {
  return (
    <article className="immersive-tutorial" aria-labelledby="reading-tutorial-title">
      <GuidedTutorialHeader
        backToTasksPath={backToTasksPath}
        hint="Leia o texto com calma, do começo ao fim. Role a página se precisar."
      />

      <div className="immersive-tutorial__content">
        <h2 id="reading-tutorial-title" className="immersive-tutorial__title">
          {stepLabel}
        </h2>
        <p>
          O mundo digital reúne ferramentas para aprender, conversar com familiares, resolver
          tarefas do dia a dia e buscar oportunidades de trabalho. Não é preciso saber tudo de uma
          vez — cada pessoa aprende no seu ritmo.
        </p>
        <p>
          Na internet, você encontra textos para estudar, vídeos explicativos, perguntas para
          refletir e quizzes para fixar o que aprendeu. O importante é ler com atenção, assistir
          com calma e pedir ajuda quando algo não estiver claro.
        </p>
        <p>
          Errar faz parte do aprendizado. Com prática e paciência, o digital pode se tornar um
          aliado na sua rotina acadêmica e profissional.
        </p>
      </div>
    </article>
  );
}

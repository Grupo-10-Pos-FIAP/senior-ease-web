import { useEffect, useState } from "react";
import type { StepTutorialProps } from "./types";

export function OpenQuestionTutorial({ stepLabel, onCanCompleteChange }: StepTutorialProps) {
  const [answer, setAnswer] = useState("");
  const canSubmit = answer.trim().length >= 3;

  useEffect(() => {
    onCanCompleteChange?.(canSubmit);
  }, [canSubmit, onCanCompleteChange]);

  return (
    <article className="immersive-tutorial" aria-labelledby="open-question-tutorial-title">
      <div className="immersive-tutorial__content">
        <h2 id="open-question-tutorial-title" className="immersive-tutorial__title">
          {stepLabel}
        </h2>

        <div className="practice-tutorial">
          <p className="practice-tutorial__intro">
            Nesta tarefa você responde uma <strong>questão aberta</strong>. Escreva com suas
            próprias palavras — não precisa ser perfeito.
          </p>

          <ol className="practice-tutorial__steps">
            <li>Leia a pergunta com atenção.</li>
            <li>Escreva sua resposta no campo abaixo, do jeito que você falaria.</li>
            <li>
              Revise o texto e toque em <strong>Enviar resposta</strong> quando estiver pronto.
            </li>
          </ol>

          <div className="practice-tutorial__panel">
            <p className="practice-tutorial__task-name">Exemplo de pergunta</p>
            <p className="practice-tutorial__question">
              O que você gostaria de aprender primeiro no mundo digital?
            </p>
            <label htmlFor="open-question-demo" className="practice-tutorial__field-label">
              Sua resposta
            </label>
            <textarea
              id="open-question-demo"
              className="practice-tutorial__textarea"
              placeholder="Digite sua resposta aqui…"
              value={answer}
              onChange={(event) => {
                setAnswer(event.target.value);
              }}
              rows={6}
            />
          </div>

          {!canSubmit ? (
            <p className="practice-tutorial__hint">
              Escreva pelo menos algumas palavras para continuar.
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

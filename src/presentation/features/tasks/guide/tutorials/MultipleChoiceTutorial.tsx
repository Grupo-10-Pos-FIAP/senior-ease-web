import { useEffect, useId, useState } from "react";
import type { StepTutorialProps } from "./types";

interface DemoOption {
  id: string;
  label: string;
}

interface DemoContent {
  question: string;
  options: DemoOption[];
}

function isEmailQuizStep(stepLabel: string): boolean {
  return /e-mail|email|mensagem/i.test(stepLabel);
}

function getDemoContent(stepLabel: string): DemoContent {
  if (isEmailQuizStep(stepLabel)) {
    return {
      question: "Qual campo indica para quem você está enviando o e-mail?",
      options: [
        { id: "opt-para", label: 'Campo "Para"' },
        { id: "opt-assunto", label: 'Campo "Assunto"' },
        { id: "opt-corpo", label: "Corpo da mensagem" },
        { id: "opt-anexos", label: "Anexos" },
      ],
    };
  }

  return {
    question: "Qual atitude ajuda a estudar com segurança na internet?",
    options: [
      { id: "opt-a", label: "Pedir ajuda quando tiver dúvida" },
      { id: "opt-b", label: "Clicar em links desconhecidos sem ler" },
      { id: "opt-c", label: "Usar senhas fáceis de adivinhar" },
      { id: "opt-d", label: "Ignorar avisos de segurança" },
    ],
  };
}

export function MultipleChoiceTutorial({ stepLabel, onCanCompleteChange }: StepTutorialProps) {
  const groupId = useId();
  const { question, options } = getDemoContent(stepLabel);
  const [selected, setSelected] = useState<string | null>(null);
  const hasSelection = selected !== null;

  useEffect(() => {
    onCanCompleteChange?.(hasSelection);
  }, [hasSelection, onCanCompleteChange]);

  return (
    <article className="immersive-tutorial" aria-labelledby="mc-tutorial-title">
      <div className="immersive-tutorial__content">
        <h2 id="mc-tutorial-title" className="immersive-tutorial__title">
          {stepLabel}
        </h2>

        <div className="practice-tutorial">
          <p className="practice-tutorial__intro">
            Nesta tarefa você responde um <strong>quiz de múltipla escolha</strong>. Siga os passos
            abaixo e pratique com o exemplo.
          </p>

          <ol className="practice-tutorial__steps">
            <li>Leia a pergunta com calma — ela explica o que você deve responder.</li>
            <li>
              Toque na opção que você acha correta. O círculo ao lado fica marcado quando a opção
              está selecionada.
            </li>
            <li>
              Em cada pergunta você escolhe <strong>apenas uma</strong> resposta. Se tocar em outra
              opção, a anterior desmarca sozinha.
            </li>
            <li>Confira sua escolha antes de tocar no botão abaixo.</li>
          </ol>

          <fieldset className="practice-tutorial__panel">
            <legend className="practice-tutorial__task-name">Exemplo de pergunta</legend>
            <p id={groupId} className="practice-tutorial__question">
              {question}
            </p>
            <ul className="practice-tutorial__options" role="radiogroup" aria-labelledby={groupId}>
              {options.map((option) => {
                const isSelected = selected === option.id;
                const inputId = `${groupId}-${option.id}`;

                return (
                  <li key={option.id}>
                    <label
                      htmlFor={inputId}
                      className={`practice-tutorial__option${isSelected ? " practice-tutorial__option--selected" : ""}`}
                    >
                      <input
                        id={inputId}
                        type="radio"
                        name={`${groupId}-demo`}
                        checked={isSelected}
                        onChange={() => {
                          setSelected(option.id);
                        }}
                      />
                      <span>{option.label}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </fieldset>

          {!hasSelection ? (
            <p className="practice-tutorial__hint">Escolha uma opção para continuar.</p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
